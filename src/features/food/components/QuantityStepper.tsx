interface Props {
  quantity: number;
  onChange: (qty: number) => void;
  max?: number;
}

export function QuantityStepper({ quantity, onChange, max = 10 }: Props) {
  const atMin = quantity <= 1;
  const atMax = quantity >= max;

  const getButtonClass = (disabled: boolean) =>
    `w-9 h-9 rounded-full flex items-center justify-center text-white border-none text-xl font-bold transition-all ${
      disabled ? 'bg-border-app cursor-not-allowed' : 'bg-secondary cursor-pointer active:scale-[0.95]'
    }`;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={atMin}
        onClick={() => !atMin && onChange(quantity - 1)}
        aria-label="Decrease quantity"
        className={getButtonClass(atMin)}
      >
        −
      </button>
      <span
        aria-label={`Quantity ${quantity}`}
        className="min-w-[36px] text-center text-base font-semibold text-text-app"
      >
        {quantity}x
      </span>
      <button
        type="button"
        disabled={atMax}
        onClick={() => !atMax && onChange(quantity + 1)}
        aria-label="Increase quantity"
        className={getButtonClass(atMax)}
      >
        +
      </button>
    </div>
  );
}
