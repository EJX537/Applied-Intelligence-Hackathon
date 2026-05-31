
interface Props {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

export function NutrientBar({ label, value, target, unit, color }: Props) {
  const ratio = target > 0 ? value / target : 0;
  const widthPct = Math.min(100, Math.max(0, ratio * 100));
  const percentLabel = Math.round(ratio * 100);

  return (
    <div
      className="my-1.5"
      aria-label={`${label}: ${value} of ${target} ${unit}, ${percentLabel} percent`}
    >
      <div className="flex justify-between mb-1">
        <span className="text-[13px] text-text-app font-semibold">{label}</span>
        <span className="text-xs text-text-light">
          {value}/{target}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-border-app rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-[width] duration-200 ease-in-out`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
