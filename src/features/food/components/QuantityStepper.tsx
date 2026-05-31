import { colors } from '../constants/colors';

interface Props {
  quantity: number;
  onChange: (qty: number) => void;
  max?: number;
}

export function QuantityStepper({ quantity, onChange, max = 10 }: Props) {
  const atMin = quantity <= 1;
  const atMax = quantity >= max;

  const buttonStyle = (disabled: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 18,
    background: disabled ? colors.border : colors.secondary,
    color: '#fff',
    border: 'none',
    fontSize: 20,
    fontWeight: 700,
    lineHeight: '22px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        type="button"
        disabled={atMin}
        onClick={() => !atMin && onChange(quantity - 1)}
        aria-label="Decrease quantity"
        style={buttonStyle(atMin)}
      >
        −
      </button>
      <span
        aria-label={`Quantity ${quantity}`}
        style={{
          minWidth: 36,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 600,
          color: colors.text,
        }}
      >
        {quantity}x
      </span>
      <button
        type="button"
        disabled={atMax}
        onClick={() => !atMax && onChange(quantity + 1)}
        aria-label="Increase quantity"
        style={buttonStyle(atMax)}
      >
        +
      </button>
    </div>
  );
}
