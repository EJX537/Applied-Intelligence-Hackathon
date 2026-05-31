import { colors } from '../constants/colors';

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
      style={{ margin: '6px 0' }}
      aria-label={`${label}: ${value} of ${target} ${unit}, ${percentLabel} percent`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: colors.text, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: colors.textLight }}>
          {value}/{target}
          {unit}
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: colors.border,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${widthPct}%`,
            background: color,
            borderRadius: 4,
            transition: 'width 200ms ease',
          }}
        />
      </div>
    </div>
  );
}
