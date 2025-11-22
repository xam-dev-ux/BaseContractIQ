export interface ContractData {
  address: string;
  deploymentDate: Date;
  txHash: string;
  bytecodeSize: number;
  isProxy: boolean;
  isVerified: boolean;
  interactionCount: number;
  eventCount: number;
  bytecode: string;
  deploymentTimestamp: number;
}

export interface ScoringResult {
  score: number;
  label: "high-quality" | "neutral" | "airdrop-farming";
  reasons: string[];
}

export interface ContractAnalysis extends ContractData {
  scoring: ScoringResult;
}

export interface WalletAnalysis {
  address: string;
  contracts: ContractAnalysis[];
  overallScore: number;
  overallLabel: "high-quality" | "neutral" | "airdrop-farming";
  summary: {
    totalContracts: number;
    highQuality: number;
    neutral: number;
    airdropFarming: number;
  };
}
