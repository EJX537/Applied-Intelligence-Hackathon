import { useState } from 'react';

interface Props {
  onSubmit: (grams: number) => void;
}

export function CustomGramInput({ onSubmit }: Props) {
  const [text, setText] = useState<string>('');

  const handleSubmit = () => {
    const parsed = parseFloat(text);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onSubmit(parsed);
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="number"
        inputMode="numeric"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
        placeholder="grams"
        aria-label="Custom portion in grams"
        className="flex-1 h-10 border border-border-app rounded-lg px-3 bg-card-app text-text-app text-sm outline-none"      />
      <button
        type="button"
        onClick={handleSubmit}
        aria-label="Set custom grams"
        className="bg-primary text-white font-semibold border-none h-10 px-4 rounded-lg active:scale-[0.98] transition-transform"      >
        Set
      </button>
    </div>
  );
}
