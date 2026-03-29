import type { RiskLevel } from "@/lib/auditEngine";
import { riskLevelColor, riskLevelBg, riskLevelPercent } from "@/lib/utils";

interface RiskMeterProps {
  level: RiskLevel;
}

export default function RiskMeter({ level }: RiskMeterProps) {
  const percent = riskLevelPercent(level);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Risk Level
        </span>
        <span className={`text-lg font-bold ${riskLevelColor(level)}`}>
          {level}
        </span>
      </div>
      <div
        className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Risk level: ${level}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${riskLevelBg(level)}`}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>Safe</span>
        <span>Dangerous</span>
      </div>
    </div>
  );
}
