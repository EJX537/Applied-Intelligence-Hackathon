import { useState } from 'react';
import { colors } from '../constants/colors';

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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
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
        style={{
          flex: 1,
          height: 40,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          padding: '0 12px',
          background: colors.card,
          color: colors.text,
          fontSize: 14,
        }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        aria-label="Set custom grams"
        style={{
          background: colors.primary,
          color: '#fff',
          fontWeight: 600,
          border: 'none',
          height: 40,
          padding: '0 16px',
          borderRadius: 8,
        }}
      >
        Set
      </button>
    </div>
  );
}
