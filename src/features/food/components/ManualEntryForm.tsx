import { useState } from 'react';

interface ManualNutrients {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Props {
  itemName: string;
  onSubmit: (nutrients: ManualNutrients) => void;
  onSkip: () => void;
}

export function ManualEntryForm({ itemName, onSubmit, onSkip }: Props) {
  const [calories, setCalories] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');

  const parseField = (v: string): number => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const handleSave = () => {
    onSubmit({
      calories: parseField(calories),
      protein_g: parseField(protein),
      carbs_g: parseField(carbs),
      fat_g: parseField(fat),
    });
  };

  const rowClass = 'flex items-center mb-2.5';
  const labelClass = 'w-[100px] text-[13px] text-[#666666]';
  const inputClass = 'flex-1 h-10 border border-[#E0E0E0] rounded-lg px-2.5 bg-[#fafafa] text-[#333333] text-sm';

  return (
    <div className="bg-white rounded-xl p-4 my-2">
      <div className="text-[15px] font-semibold text-[#333333] mb-3">
        Add nutrition for: {itemName}
      </div>
      <div className={rowClass}>
        <span className={labelClass}>Calories</span>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="0"
          aria-label={`Calories for ${itemName}`}
          className={inputClass}
        />
      </div>
      <div className={rowClass}>
        <span className={labelClass}>Protein (g)</span>
        <input
          type="number"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          placeholder="0"
          aria-label={`Protein grams for ${itemName}`}
          className={inputClass}
        />
      </div>
      <div className={rowClass}>
        <span className={labelClass}>Carbs (g)</span>
        <input
          type="number"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          placeholder="0"
          aria-label={`Carbs grams for ${itemName}`}
          className={inputClass}
        />
      </div>
      <div className={rowClass}>
        <span className={labelClass}>Fat (g)</span>
        <input
          type="number"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          placeholder="0"
          aria-label={`Fat grams for ${itemName}`}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={handleSave}
          aria-label={`Save nutrition for ${itemName}`}
          className="h-11 rounded-xl bg-[#4CAF50] text-white font-semibold border-none"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onSkip}
          aria-label={`Skip and log ${itemName} without nutrition`}
          className="h-11 rounded-xl bg-transparent text-[#666666] border border-[#E0E0E0]"
        >
          Skip — log without nutrition
        </button>
      </div>
    </div>
  );
}
