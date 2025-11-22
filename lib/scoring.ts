import { ContractData, ScoringResult } from "./types";
import {
  analyzeBytecodePattern,
  detectBytecodeRepetition,
  isSimilarBytecode,
} from "./bytecode";
import {
  analyzeContractActivity,
  analyzeDeploymentPattern,
  detectMassDeployment,
} from "./activity";

export function scoreContract(
  contract: ContractData,
  allContracts: ContractData[]
): ScoringResult {
  let score = 0;
  const reasons: string[] = [];

  if (contract.isVerified) {
    score += 15;
    reasons.push("+15: Contract verified");
  } else {
    score -= 10;
    reasons.push("-10: Contract not verified");
  }

  const bytecodeAnalysis = analyzeBytecodePattern(contract.bytecode);

  if (bytecodeAnalysis.isSmall) {
    score -= 15;
    reasons.push(`-15: Small bytecode (${contract.bytecodeSize} bytes)`);
  }

  if (bytecodeAnalysis.lowEntropy) {
    score -= 10;
    reasons.push(
      `-10: Low entropy bytecode (${bytecodeAnalysis.entropy.toFixed(2)})`
    );
  }

  if (contract.bytecodeSize > 1000) {
    score += 5;
    reasons.push("+5: Substantial bytecode size");
  }

  if (contract.isProxy) {
    score += 10;
    reasons.push("+10: Proxy pattern detected");
  }

  const activity = analyzeContractActivity(contract);

  if (activity.hasRealActivity) {
    score += 15;
    reasons.push("+15: Real activity detected");
  } else {
    score -= 10;
    reasons.push("-10: No significant activity");
  }

  if (contract.interactionCount === 0) {
    score -= 15;
    reasons.push("-15: Zero interactions");
  } else if (contract.interactionCount > 10) {
    score += 10;
    reasons.push("+10: Multiple interactions");
  }

  if (contract.eventCount === 0) {
    score -= 10;
    reasons.push("-10: No events emitted");
  } else if (contract.eventCount > 5) {
    score += 5;
    reasons.push("+5: Events emitted");
  }

  const repeatedBytecodes = detectBytecodeRepetition(
    allContracts.map((c) => ({ bytecode: c.bytecode, address: c.address }))
  );

  repeatedBytecodes.forEach((addresses, bytecode) => {
    if (addresses.includes(contract.address)) {
      score -= 15;
      reasons.push(`-15: Bytecode repeated ${addresses.length} times`);
    }
  });

  const similarContracts = allContracts.filter(
    (c) =>
      c.address !== contract.address &&
      isSimilarBytecode(c.bytecode, contract.bytecode)
  );

  if (similarContracts.length > 0) {
    score -= 10;
    reasons.push(
      `-10: Similar bytecode to ${similarContracts.length} other contract(s)`
    );
  }

  let label: "high-quality" | "neutral" | "airdrop-farming";
  if (score >= 20) {
    label = "high-quality";
  } else if (score >= -10) {
    label = "neutral";
  } else {
    label = "airdrop-farming";
  }

  return { score, label, reasons };
}

export function scoreWallet(contracts: ContractData[]): {
  score: number;
  label: "high-quality" | "neutral" | "airdrop-farming";
  reasons: string[];
} {
  if (contracts.length === 0) {
    return {
      score: 0,
      label: "neutral",
      reasons: ["No contracts deployed"],
    };
  }

  let totalScore = 0;
  const reasons: string[] = [];

  contracts.forEach((contract) => {
    const contractScore = scoreContract(contract, contracts);
    totalScore += contractScore.score;
  });

  const avgScore = totalScore / contracts.length;

  const deploymentAnalysis = analyzeDeploymentPattern(contracts);

  if (deploymentAnalysis.burstDeployments) {
    totalScore -= 20;
    reasons.push("-20: Burst deployment pattern detected");
  }

  if (deploymentAnalysis.deploymentsPerHour > 5) {
    totalScore -= 15;
    reasons.push(
      `-15: High deployment frequency (${deploymentAnalysis.deploymentsPerHour.toFixed(1)}/hour)`
    );
  }

  if (detectMassDeployment(contracts)) {
    totalScore -= 25;
    reasons.push("-25: Mass deployment pattern");
  }

  const verifiedCount = contracts.filter((c) => c.isVerified).length;
  const verifiedRatio = verifiedCount / contracts.length;

  if (verifiedRatio > 0.7) {
    totalScore += 20;
    reasons.push("+20: High verification ratio");
  } else if (verifiedRatio < 0.3) {
    totalScore -= 15;
    reasons.push("-15: Low verification ratio");
  }

  const activeContracts = contracts.filter((c) => c.interactionCount > 0).length;
  const activeRatio = activeContracts / contracts.length;

  if (activeRatio > 0.5) {
    totalScore += 15;
    reasons.push("+15: Good activity ratio");
  } else if (activeRatio < 0.2) {
    totalScore -= 20;
    reasons.push("-20: Low activity ratio");
  }

  let label: "high-quality" | "neutral" | "airdrop-farming";
  if (avgScore >= 15 && totalScore >= 30) {
    label = "high-quality";
  } else if (avgScore >= -5 && totalScore >= -20) {
    label = "neutral";
  } else {
    label = "airdrop-farming";
  }

  return { score: totalScore, label, reasons };
}
