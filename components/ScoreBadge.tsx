interface ScoreBadgeProps {
  label: "high-quality" | "neutral" | "airdrop-farming";
  score?: number;
}

export default function ScoreBadge({ label, score }: ScoreBadgeProps) {
  const badges = {
    "high-quality": {
      bg: "bg-gradient-to-r from-green-100 to-green-200",
      text: "text-green-800",
      border: "border-green-400",
      emoji: "🟢",
      label: "High Quality",
    },
    neutral: {
      bg: "bg-gradient-to-r from-yellow-100 to-yellow-200",
      text: "text-yellow-800",
      border: "border-yellow-400",
      emoji: "🟡",
      label: "Neutral",
    },
    "airdrop-farming": {
      bg: "bg-gradient-to-r from-red-100 to-red-200",
      text: "text-red-800",
      border: "border-red-400",
      emoji: "🔴",
      label: "Airdrop Farming",
    },
  };

  const badge = badges[label];

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border-2 ${badge.bg} ${badge.text} ${badge.border} shadow-sm`}
    >
      <span className="mr-1.5">{badge.emoji}</span>
      {badge.label}
      {score !== undefined && (
        <span className="ml-2 font-black">({score})</span>
      )}
    </span>
  );
}
