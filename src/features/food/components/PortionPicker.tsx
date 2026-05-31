import type { PortionOption } from '../types';
import { colors } from '../constants/colors';

interface Props {
  options: PortionOption[];
  selectedGrams: number | null;
  onSelect: (grams: number) => void;
  onCustomPress: () => void;
  customActive: boolean;
}

export function PortionPicker({
  options,
  selectedGrams,
  onSelect,
  onCustomPress,
  customActive,
}: Props) {
  const chipStyle = (selected: boolean): React.CSSProperties => ({
    minWidth: 84,
    padding: '10px 12px',
    borderRadius: 12,
    border: `1px solid ${selected ? colors.primary : colors.border}`,
    background: selected ? colors.primary : colors.card,
    color: selected ? '#fff' : colors.text,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '8px 0',
      }}
    >
      {options.map((opt) => {
        const isSelected = !customActive && selectedGrams === opt.grams;
        return (
          <button
            type="button"
            key={opt.ref}
            onClick={() => onSelect(opt.grams)}
            aria-label={`${opt.label}, ${opt.grams} grams, ${opt.visual}`}
            aria-pressed={isSelected}
            style={chipStyle(isSelected)}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: isSelected ? '#fff' : colors.textLight,
              }}
            >
              {opt.ref}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{opt.label}</span>
            <span
              style={{
                fontSize: 12,
                marginTop: 2,
                color: isSelected ? '#fff' : colors.textLight,
              }}
            >
              {opt.grams}g
            </span>
            <span
              style={{
                fontSize: 10,
                marginTop: 2,
                textAlign: 'center',
                color: isSelected ? '#fff' : colors.textLight,
              }}
            >
              {opt.visual}
            </span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={onCustomPress}
        aria-label="Set a custom portion in grams"
        aria-pressed={customActive}
        style={chipStyle(customActive)}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: customActive ? '#fff' : colors.textLight,
          }}
        >
          +
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Custom</span>
        <span
          style={{
            fontSize: 12,
            marginTop: 2,
            color: customActive ? '#fff' : colors.textLight,
          }}
        >
          set grams
        </span>
      </button>
    </div>
  );
}
