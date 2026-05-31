

interface Props {
  quantity: number;
  onChange: (qty: number) => void;
  max?: number;
}

export function QuantityStepper({ quantity, onChange, max = 10 }: Props) {
  const atMin = quantity <= 1;
  const atMax = quantity >= max;

  const buttonClass = (disabled: boolean): string =>
    `w-9 h-9 rounded-full border-none text-white text-xl font-bold leading-[22px] ${
      disabled ? 'bg-[#E0E0E0] cursor-not-allowed' : 'bg-[#2196F3] cursor-pointer'
    }`;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={atMin}
        onClick={() => !atMin && onChange(quantity - 1)}
        aria-label="Decrease quantity"
        className={buttonClass(atMin)}
      >
        −
      </button>
      <span
        aria-label={`Quantity ${quantity}`}
        className="min-w-9 text-center text-base font-semibold text-[#333333]"
      >
        {quantity}x
      </span>
      <button
        type="button"
        disabled={atMax}
        onClick={() => !atMax && onChange(quantity + 1)}
        aria-label="Increase quantity"
        className={buttonClass(atMax)}
      >
        +
      </button>
    </div>
  );
}
