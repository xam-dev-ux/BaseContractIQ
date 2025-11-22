import { createPublicClient, http, isAddress } from "viem";
import { base } from "viem/chains";
import { ContractData } from "./types";

const RPC_URL = process.env.BASE_RPC_URL || "https://base.llamarpc.com";

export function getBaseClient() {
  return createPublicClient({
    chain: base,
    transport: http(RPC_URL, {
      batch: true,
      retryCount: 3,
      retryDelay: 1000,
    }),
  });
}

export async function getContractsDeployedBy(
  address: string
): Promise<ContractData[]> {
  if (!isAddress(address)) {
    throw new Error("Invalid address");
  }

  const client = getBaseClient();
  const contracts: ContractData[] = [];

  try {
    const currentBlock = await client.getBlockNumber();
    const blocksToScan = BigInt(10000); // Scan last 10k blocks (~8 hours on Base)
    const chunkSize = BigInt(1000); // Max allowed by RPC
    const startBlock = currentBlock - blocksToScan;

    // Scan in chunks to avoid RPC limits
    for (let i = startBlock; i < currentBlock; i += chunkSize) {
      const fromBlock = i;
      const toBlock = i + chunkSize > currentBlock ? currentBlock : i + chunkSize;

      try {
        // Get all transactions in this range
        const logs = await client.getLogs({
          fromBlock,
          toBlock,
        });

        // Extract unique tx hashes
        const txHashes = Array.from(new Set(logs.map(log => log.transactionHash)));

        // Check each transaction
        for (const txHash of txHashes) {
          if (contracts.length >= 20) break; // Limit to 20 contracts max

          try {
            const tx = await client.getTransaction({ hash: txHash });

            // Check if deployer matches and it's a contract creation
            if (
              tx.from.toLowerCase() === address.toLowerCase() &&
              !tx.to
            ) {
              const receipt = await client.getTransactionReceipt({ hash: txHash });

              if (receipt.contractAddress) {
                const bytecode = await client.getBytecode({
                  address: receipt.contractAddress,
                });

                const block = await client.getBlock({
                  blockNumber: receipt.blockNumber,
                });

                const interactionCount = await getInteractionCount(
                  client,
                  receipt.contractAddress
                );
                const eventCount = receipt.logs.length;

                contracts.push({
                  address: receipt.contractAddress,
                  deploymentDate: new Date(Number(block.timestamp) * 1000),
                  txHash: txHash,
                  bytecodeSize: bytecode ? bytecode.length : 0,
                  isProxy: bytecode ? isProxyBytecode(bytecode) : false,
                  isVerified: await isContractVerified(receipt.contractAddress),
                  interactionCount,
                  eventCount,
                  bytecode: bytecode || "0x",
                  deploymentTimestamp: Number(block.timestamp),
                });
              }
            }
          } catch (error) {
            continue;
          }
        }
      } catch (error) {
        console.error(`Error scanning blocks ${fromBlock}-${toBlock}:`, error);
        continue;
      }

      if (contracts.length >= 20) break;
    }
  } catch (error) {
    console.error("Error fetching contracts:", error);
  }

  return contracts;
}

async function getInteractionCount(
  client: ReturnType<typeof getBaseClient>,
  contractAddress: string
): Promise<number> {
  try {
    const currentBlock = await client.getBlockNumber();
    const chunkSize = BigInt(1000);
    const blocksToScan = BigInt(5000); // Last 5k blocks
    const startBlock = currentBlock - blocksToScan;
    let totalLogs = 0;

    // Scan in chunks
    for (let i = startBlock; i < currentBlock; i += chunkSize) {
      const fromBlock = i;
      const toBlock = i + chunkSize > currentBlock ? currentBlock : i + chunkSize;

      try {
        const logs = await client.getLogs({
          address: contractAddress as `0x${string}`,
          fromBlock,
          toBlock,
        });
        totalLogs += logs.length;
      } catch (error) {
        continue;
      }
    }

    return totalLogs;
  } catch (error) {
    return 0;
  }
}

function isProxyBytecode(bytecode: string): boolean {
  const proxyPatterns = [
    "363d3d373d3d3d363d73",
    "5c60da1b",
    "1967",
    "7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
  ];

  return proxyPatterns.some((pattern) =>
    bytecode.toLowerCase().includes(pattern.toLowerCase())
  );
}

async function isContractVerified(contractAddress: string): Promise<boolean> {
  const apiKey = process.env.ETHERSCAN_API_KEY;

  if (!apiKey) {
    return false;
  }

  try {
    // Using Etherscan API V2 unified endpoint
    // Single API key works across all chains
    // Base mainnet chainid = 8453
    const response = await fetch(
      `https://api.etherscan.io/v2/api?chainid=8453&module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`
    );

    const data = await response.json();

    if (data.status === "1" && data.result && data.result[0]) {
      return data.result[0].SourceCode !== "";
    }

    return false;
  } catch (error) {
    return false;
  }
}
