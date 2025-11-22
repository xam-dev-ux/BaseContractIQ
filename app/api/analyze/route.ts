import { NextRequest, NextResponse } from "next/server";
import { getContractsDeployedBy } from "@/lib/base";
import { scoreContract, scoreWallet } from "@/lib/scoring";
import { WalletAnalysis } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const contracts = await getContractsDeployedBy(address);

    const contractsWithScoring = contracts.map((contract) => ({
      ...contract,
      scoring: scoreContract(contract, contracts),
    }));

    const walletScore = scoreWallet(contracts);

    const summary = {
      totalContracts: contracts.length,
      highQuality: contractsWithScoring.filter(
        (c) => c.scoring.label === "high-quality"
      ).length,
      neutral: contractsWithScoring.filter((c) => c.scoring.label === "neutral")
        .length,
      airdropFarming: contractsWithScoring.filter(
        (c) => c.scoring.label === "airdrop-farming"
      ).length,
    };

    const analysis: WalletAnalysis = {
      address,
      contracts: contractsWithScoring,
      overallScore: walletScore.score,
      overallLabel: walletScore.label,
      summary,
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze address" },
      { status: 500 }
    );
  }
}
