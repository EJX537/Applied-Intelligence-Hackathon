<<<<<<< HEAD
=======


>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
interface Props {
  quantity: number;
  onChange: (qty: number) => void;
  max?: number;
}

export function QuantityStepper({ quantity, onChange, max = 10 }: Props) {
  const atMin = quantity <= 1;
  const atMax = quantity >= max;

<<<<<<< HEAD
  const getButtonClass = (disabled: boolean) =>
    `w-9 h-9 rounded-full flex items-center justify-center text-white border-none text-xl font-bold transition-all ${
      disabled ? 'bg-border-app cursor-not-allowed' : 'bg-secondary cursor-pointer active:scale-[0.95]'
=======
  const buttonClass = (disabled: boolean): string =>
    `w-9 h-9 rounded-full border-none text-white text-xl font-bold leading-[22px] ${
      disabled ? 'bg-[#E0E0E0] cursor-not-allowed' : 'bg-[#2196F3] cursor-pointer'
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
    }`;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={atMin}
        onClick={() => !atMin && onChange(quantity - 1)}
        aria-label="Decrease quantity"
<<<<<<< HEAD
        className={getButtonClass(atMin)}
=======
        className={buttonClass(atMin)}
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
      >
        −
      </button>
      <span
        aria-label={`Quantity ${quantity}`}
<<<<<<< HEAD
        className="min-w-[36px] text-center text-base font-semibold text-text-app"
=======
        className="min-w-9 text-center text-base font-semibold text-[#333333]"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
      >
        {quantity}x
      </span>
      <button
        type="button"
        disabled={atMax}
        onClick={() => !atMax && onChange(quantity + 1)}
        aria-label="Increase quantity"
<<<<<<< HEAD
        className={getButtonClass(atMax)}
=======
        className={buttonClass(atMax)}
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
      >
        +
      </button>
    </div>
  );
}
