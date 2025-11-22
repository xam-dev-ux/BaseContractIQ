import { ContractData } from "./types";

export interface ActivityMetrics {
  hasRealActivity: boolean;
  uniqueInteractors: number;
  deploymentBurst: boolean;
  deploymentFrequency: number;
  hasAdminChanges: boolean;
}

export function analyzeDeploymentPattern(
  contracts: ContractData[]
): {
  burstDeployments: boolean;
  deploymentsPerHour: number;
  deploymentsPerDay: number;
} {
  if (contracts.length === 0) {
    return {
      burstDeployments: false,
      deploymentsPerHour: 0,
      deploymentsPerDay: 0,
    };
  }

  const timestamps = contracts.map((c) => c.deploymentTimestamp).sort();
  const timeWindows: { [key: number]: number } = {};

  timestamps.forEach((ts) => {
    const minuteWindow = Math.floor(ts / 60);
    timeWindows[minuteWindow] = (timeWindows[minuteWindow] || 0) + 1;
  });

  const maxDeploymentsPerMinute = Math.max(...Object.values(timeWindows));
  const burstDeployments = maxDeploymentsPerMinute >= 10;

  const firstDeployment = timestamps[0];
  const lastDeployment = timestamps[timestamps.length - 1];
  const totalTimeHours = (lastDeployment - firstDeployment) / 3600;
  const totalTimeDays = totalTimeHours / 24;

  const deploymentsPerHour =
    totalTimeHours > 0 ? contracts.length / totalTimeHours : contracts.length;
  const deploymentsPerDay =
    totalTimeDays > 0 ? contracts.length / totalTimeDays : contracts.length;

  return {
    burstDeployments,
    deploymentsPerHour,
    deploymentsPerDay,
  };
}

export function analyzeContractActivity(contract: ContractData): ActivityMetrics {
  const hasRealActivity =
    contract.interactionCount > 5 || contract.eventCount > 10;

  const uniqueInteractors = Math.floor(contract.interactionCount / 3);

  const hasAdminChanges = contract.eventCount > 0 && contract.interactionCount > 0;

  return {
    hasRealActivity,
    uniqueInteractors,
    deploymentBurst: false,
    deploymentFrequency: 0,
    hasAdminChanges,
  };
}

export function detectMassDeployment(contracts: ContractData[]): boolean {
  if (contracts.length < 10) return false;

  const pattern = analyzeDeploymentPattern(contracts);
  return pattern.burstDeployments || pattern.deploymentsPerHour > 5;
}
