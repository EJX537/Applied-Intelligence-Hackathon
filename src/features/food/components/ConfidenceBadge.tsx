

interface Props {
  confidence: 'high' | 'medium' | 'low';
}

export function ConfidenceBadge({ confidence }: Props) {
  if (confidence === 'high') return null;

  if (confidence === 'medium') {
    return (
      <span
        aria-label="Medium confidence"
        className="text-warning text-sm font-bold"      >
        !
      </span>
    );
  }

  return (
    <span
      aria-label="Low confidence"
      className="inline-flex gap-1 items-center text-danger font-semibold text-xs"    >
      <span className="text-sm font-bold">x</span>
      Low confidence
    </span>
  );
}
