"use client";

import { useState } from "react";
import WalletForm from "@/components/WalletForm";
import ContractTable from "@/components/ContractTable";
import ScoreBadge from "@/components/ScoreBadge";
import { WalletAnalysis } from "@/lib/types";

export default function Home() {
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (address: string) => {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze address");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError("Failed to analyze the address. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 gradient-base rounded-2xl shadow-base">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-4">
            Base Contract IQ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Detect quality & farming patterns on Base
          </p>
        </div>

        <WalletForm onSubmit={handleAnalyze} loading={loading} />

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-5 glass-effect rounded-2xl border-2 border-red-300">
            <p className="text-red-700 text-center font-medium">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-8 animate-fadeIn">
            <div className="glass-effect rounded-3xl shadow-base p-8">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center gap-3">
                <span className="w-2 h-8 gradient-base rounded-full"></span>
                Wallet Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gray-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
                  <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">Total</p>
                  <p className="text-4xl font-black text-gray-900">
                    {analysis.summary.totalContracts}
                  </p>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-300 rounded-full -mr-10 -mt-10 opacity-30"></div>
                  <p className="text-sm font-medium text-green-700 mb-2 uppercase tracking-wide">Quality</p>
                  <p className="text-4xl font-black text-green-800">
                    {analysis.summary.highQuality}
                  </p>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300 rounded-full -mr-10 -mt-10 opacity-30"></div>
                  <p className="text-sm font-medium text-yellow-700 mb-2 uppercase tracking-wide">Neutral</p>
                  <p className="text-4xl font-black text-yellow-800">
                    {analysis.summary.neutral}
                  </p>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-300 rounded-full -mr-10 -mt-10 opacity-30"></div>
                  <p className="text-sm font-medium text-red-700 mb-2 uppercase tracking-wide">Farming</p>
                  <p className="text-4xl font-black text-red-800">
                    {analysis.summary.airdropFarming}
                  </p>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Overall Score
                    </h3>
                    <p className="text-sm text-gray-500">
                      Aggregated from all contracts
                    </p>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-3 rounded-2xl gradient-base shadow-base">
                      <span className="text-4xl font-black text-white">
                        {analysis.overallScore}
                      </span>
                    </div>
                    <div>
                      <ScoreBadge label={analysis.overallLabel} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                <span className="w-2 h-8 gradient-base rounded-full"></span>
                Contracts Deployed
              </h2>
              <ContractTable contracts={analysis.contracts} />
            </div>
          </div>
        )}

        {!analysis && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100">
              <svg
                className="w-16 h-16 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-xl font-medium">
              Enter a wallet address to begin analysis
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
