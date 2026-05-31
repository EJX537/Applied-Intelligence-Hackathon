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
<<<<<<< HEAD
  const getChipClass = (selected: boolean) =>
    `min-w-[84px] py-2.5 px-3 rounded-xl border flex flex-col items-center shrink-0 cursor-pointer transition-all active:scale-[0.95] ${
      selected
        ? 'border-primary bg-primary text-white'
        : 'border-border-app bg-card-app text-text-app'
    }`;
=======
  const chipClass = (selected: boolean): string =>
    `min-w-[84px] px-3 py-2.5 rounded-xl border ${
      selected ? 'border-[#4CAF50] bg-[#4CAF50] text-white' : 'border-[#E0E0E0] bg-white text-[#333333]'
    } cursor-pointer flex flex-col items-center shrink-0`;
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa

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
<<<<<<< HEAD
            className={getChipClass(isSelected)}
          >
            <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-text-light'}`}>
              {opt.ref}
            </span>
            <span className="text-[13px] font-semibold mt-0.5">{opt.label}</span>
            <span className={`text-xs mt-0.5 ${isSelected ? 'text-white' : 'text-text-light'}`}>
              {opt.grams}g
            </span>
            <span className={`text-[10px] mt-0.5 text-center ${isSelected ? 'text-white' : 'text-text-light'}`}>
=======
            className={chipClass(isSelected)}
          >
            <span className={`text-base font-bold ${isSelected ? 'text-white' : 'text-[#666666]'}`}>
              {opt.ref}
            </span>
            <span className="text-[13px] font-semibold mt-0.5">{opt.label}</span>
            <span className={`text-xs mt-0.5 ${isSelected ? 'text-white' : 'text-[#666666]'}`}>
              {opt.grams}g
            </span>
            <span className={`text-[10px] mt-0.5 text-center ${isSelected ? 'text-white' : 'text-[#666666]'}`}>
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
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
<<<<<<< HEAD
        className={getChipClass(customActive)}
      >
        <span className={`text-base font-bold ${customActive ? 'text-white' : 'text-text-light'}`}>
          +
        </span>
        <span className="text-[13px] font-semibold mt-0.5">Custom</span>
        <span className={`text-xs mt-0.5 ${customActive ? 'text-white' : 'text-text-light'}`}>
=======
        className={chipClass(customActive)}
      >
        <span className={`text-base font-bold ${customActive ? 'text-white' : 'text-[#666666]'}`}>
          +
        </span>
        <span className="text-[13px] font-semibold mt-0.5">Custom</span>
        <span className={`text-xs mt-0.5 ${customActive ? 'text-white' : 'text-[#666666]'}`}>
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
          set grams
        </span>
      </button>
    </div>
  );
}
