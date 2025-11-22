import { ContractAnalysis } from "@/lib/types";
import ScoreBadge from "./ScoreBadge";

interface ContractTableProps {
  contracts: ContractAnalysis[];
}

export default function ContractTable({ contracts }: ContractTableProps) {
  if (contracts.length === 0) {
    return (
      <div className="text-center py-12 glass-effect rounded-2xl shadow-base">
        <p className="text-gray-500 text-lg font-medium">No contracts found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto glass-effect rounded-2xl shadow-base">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Contract
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Deployment
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Size
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Proxy
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Verified
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Activity
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Events
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Quality
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {contracts.map((contract, idx) => (
            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <a
                    href={`https://basescan.org/address/${contract.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-mono text-sm font-medium hover:underline inline-flex items-center gap-1"
                  >
                    {contract.address.slice(0, 8)}...{contract.address.slice(-6)}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href={`https://basescan.org/tx/${contract.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 font-mono text-xs hover:underline inline-flex items-center gap-1"
                  >
                    tx: {contract.txHash.slice(0, 10)}...
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="font-medium text-gray-900">
                  {contract.deploymentDate.toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  {contract.deploymentDate.toLocaleTimeString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-medium">
                  {contract.bytecodeSize}b
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    contract.isProxy
                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                >
                  {contract.isProxy ? "✓ Proxy" : "No"}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    contract.isVerified
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  {contract.isVerified ? "✓ Yes" : "✗ No"}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {contract.interactionCount}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {contract.eventCount}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                  <ScoreBadge
                    label={contract.scoring.label}
                    score={contract.scoring.score}
                  />
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-blue-600 font-medium transition-colors">
                      View reasons
                    </summary>
                    <ul className="mt-2 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {contract.scoring.reasons.map((reason, i) => (
                        <li key={i} className="text-xs leading-relaxed">{reason}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
