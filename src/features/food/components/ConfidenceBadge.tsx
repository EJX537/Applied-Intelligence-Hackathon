

interface Props {
  confidence: 'high' | 'medium' | 'low';
}

export function ConfidenceBadge({ confidence }: Props) {
  if (confidence === 'high') return null;

  if (confidence === 'medium') {
    return (
      <span
        aria-label="Medium confidence"
<<<<<<< HEAD
        className="text-warning text-sm font-bold"
=======
        className="text-[#FF9800] text-sm font-bold"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
      >
        !
      </span>
    );
  }

  return (
    <span
      aria-label="Low confidence"
<<<<<<< HEAD
      className="inline-flex gap-1 items-center text-danger font-semibold text-xs"
=======
      className="inline-flex gap-1 items-center text-[#F44336] font-semibold text-xs"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
    >
      <span className="text-sm font-bold">x</span>
      Low confidence
    </span>
  );
}
