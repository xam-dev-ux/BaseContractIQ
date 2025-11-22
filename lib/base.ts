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
    const blocksToScan = BigInt(5000); // Scan last 5k blocks (~4 hours on Base)
    const startBlock = currentBlock - blocksToScan;

    // Use Etherscan API (fast path)
    const etherscanContracts = await getContractsFromEtherscan(address, currentBlock);

    if (etherscanContracts.length > 0) {
      return etherscanContracts;
    }

    // Fallback: Quick scan only recent blocks
    const quickScanBlocks = BigInt(1000); // Only 1k blocks for fallback
    let chunkSize = BigInt(100);

    for (let i = currentBlock - quickScanBlocks; i < currentBlock; i += chunkSize) {
      const fromBlock = i;
      const toBlock = i + chunkSize > currentBlock ? currentBlock : i + chunkSize;

      try {
        // Get all transactions in this range
        const logs = await client.getLogs({
          fromBlock,
          toBlock,
        });

        // If successful with large chunk, increase size
        if (logs.length < 10000 && chunkSize < BigInt(500)) {
          chunkSize = BigInt(500);
        }

        // Extract unique tx hashes
        const txHashes = Array.from(new Set(logs.map(log => log.transactionHash)));

        // Check each transaction
        for (const txHash of txHashes) {
          if (contracts.length >= 5) break; // Limit to 5 for fallback

          try {
            const tx = await client.getTransaction({ hash: txHash });

            // Check if deployer matches and it's a contract creation
            if (
              tx.from.toLowerCase() === address.toLowerCase() &&
              !tx.to
            ) {
              const receipt = await client.getTransactionReceipt({ hash: txHash });

              if (receipt.contractAddress) {
                const [bytecode, block] = await Promise.all([
                  client.getBytecode({ address: receipt.contractAddress }),
                  client.getBlock({ blockNumber: receipt.blockNumber }),
                ]);

                contracts.push({
                  address: receipt.contractAddress,
                  deploymentDate: new Date(Number(block.timestamp) * 1000),
                  txHash: txHash,
                  bytecodeSize: bytecode ? bytecode.length : 0,
                  isProxy: bytecode ? isProxyBytecode(bytecode) : false,
                  isVerified: false, // Skip verification in fallback
                  interactionCount: 0, // Skip interaction count in fallback
                  eventCount: receipt.logs.length,
                  bytecode: bytecode || "0x",
                  deploymentTimestamp: Number(block.timestamp),
                });
              }
            }
          } catch (error) {
            continue;
          }
        }
      } catch (error: any) {
        // If chunk too large, reduce size and retry
        if (error.message?.includes('max results')) {
          chunkSize = BigInt(Math.max(10, Number(chunkSize) / 10));
          i -= chunkSize; // Retry this range
          continue;
        }
        console.error(`Error scanning blocks ${fromBlock}-${toBlock}:`, error);
        continue;
      }

      if (contracts.length >= 5) break;
    }
  } catch (error) {
    console.error("Error fetching contracts:", error);
  }

  return contracts;
}

async function getQuickInteractionCount(
  client: ReturnType<typeof getBaseClient>,
  contractAddress: string
): Promise<number> {
  try {
    const currentBlock = await client.getBlockNumber();
    const fromBlock = currentBlock - BigInt(1000); // Last 1k blocks only

    const logs = await client.getLogs({
      address: contractAddress as `0x${string}`,
      fromBlock,
      toBlock: currentBlock,
    });

    return logs.length;
  } catch (error) {
    return 0;
  }
}

async function getInteractionCount(
  client: ReturnType<typeof getBaseClient>,
  contractAddress: string
): Promise<number> {
  // Use quick count for performance
  return getQuickInteractionCount(client, contractAddress);
}

async function getContractsFromEtherscan(
  address: string,
  currentBlock: bigint
): Promise<ContractData[]> {
  const apiKey = process.env.ETHERSCAN_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    // Get contract creations from Etherscan API
    const response = await fetch(
      `https://api.etherscan.io/v2/api?chainid=8453&module=account&action=txlist&address=${address}&startblock=0&endblock=${currentBlock}&page=1&offset=50&sort=desc&apikey=${apiKey}`,
      { signal: AbortSignal.timeout(10000) } // 10s timeout
    );

    const data = await response.json();

    if (data.status !== "1" || !data.result) {
      return [];
    }

    const client = getBaseClient();
    const contracts: ContractData[] = [];

    // Process in parallel batches for speed
    const contractCreations = data.result.filter((tx: any) => !tx.to || tx.to === "");

    for (const tx of contractCreations.slice(0, 10)) { // Max 10 contracts
      try {
        const receipt = await client.getTransactionReceipt({
          hash: tx.hash as `0x${string}`,
        });

        if (receipt.contractAddress) {
          // Parallel fetch for speed
          const [bytecode, isVerified] = await Promise.all([
            client.getBytecode({ address: receipt.contractAddress }),
            isContractVerified(receipt.contractAddress),
          ]);

          // Quick interaction count (no chunking, just estimate)
          const interactionCount = await getQuickInteractionCount(
            client,
            receipt.contractAddress
          );

          contracts.push({
            address: receipt.contractAddress,
            deploymentDate: new Date(Number(tx.timeStamp) * 1000),
            txHash: tx.hash,
            bytecodeSize: bytecode ? bytecode.length : 0,
            isProxy: bytecode ? isProxyBytecode(bytecode) : false,
            isVerified,
            interactionCount,
            eventCount: receipt.logs.length,
            bytecode: bytecode || "0x",
            deploymentTimestamp: Number(tx.timeStamp),
          });

          if (contracts.length >= 10) break;
        }
      } catch (error) {
        continue;
      }
    }

    return contracts;
  } catch (error) {
    console.error("Etherscan API error:", error);
    return [];
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
