import type { PortionOption } from '../types';

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
  const getChipClass = (selected: boolean) =>
    `min-w-[84px] py-2.5 px-3 rounded-xl border flex flex-col items-center shrink-0 cursor-pointer transition-all active:scale-[0.95] ${
      selected
        ? 'border-primary bg-primary text-white'
        : 'border-border-app bg-card-app text-text-app'
    }`;
  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {options.map((opt) => {
        const isSelected = !customActive && selectedGrams === opt.grams;
        return (
          <button
            type="button"
            key={opt.ref}
            onClick={() => onSelect(opt.grams)}
            aria-label={`${opt.label}, ${opt.grams} grams, ${opt.visual}`}
            aria-pressed={isSelected}
            className={getChipClass(isSelected)}
          >
            <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-text-light'}`}>
              {opt.ref}
            </span>
            <span className="text-[13px] font-semibold mt-0.5">{opt.label}</span>
            <span className={`text-xs mt-0.5 ${isSelected ? 'text-white' : 'text-text-light'}`}>
              {opt.grams}g
            </span>
            <span className={`text-[10px] mt-0.5 text-center ${isSelected ? 'text-white' : 'text-text-light'}`}>              {opt.visual}
            </span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={onCustomPress}
        aria-label="Set a custom portion in grams"
        aria-pressed={customActive}
        className={getChipClass(customActive)}
      >
        <span className={`text-base font-bold ${customActive ? 'text-white' : 'text-text-light'}`}>
          +
        </span>
        <span className="text-[13px] font-semibold mt-0.5">Custom</span>
        <span className={`text-xs mt-0.5 ${customActive ? 'text-white' : 'text-text-light'}`}>          set grams
        </span>
      </button>
    </div>
  );
}
