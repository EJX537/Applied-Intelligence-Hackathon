import { colors } from '../constants/colors';

interface Props {
  confidence: 'high' | 'medium' | 'low';
}

export function ConfidenceBadge({ confidence }: Props) {
  if (confidence === 'high') return null;

  if (confidence === 'medium') {
    return (
      <span
        aria-label="Medium confidence"
        style={{ color: colors.warning, fontSize: 14, fontWeight: 700 }}
      >
        !
      </span>
    );
  }

  return (
    <span
      aria-label="Low confidence"
      style={{
        display: 'inline-flex',
        gap: 4,
        alignItems: 'center',
        color: colors.danger,
        fontWeight: 600,
        fontSize: 12,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700 }}>x</span>
      Low confidence
    </span>
  );
}
