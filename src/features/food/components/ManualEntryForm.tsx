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

<<<<<<< HEAD
  return (
    <div className="bg-card-app rounded-xl p-4 my-2">
      <div className="text-[15px] font-semibold text-text-app mb-3">
        Add nutrition for: {itemName}
      </div>
      <div className="flex items-center mb-2.5">
        <span className="w-[100px] text-[13px] text-text-light">Calories</span>
=======
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
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="0"
          aria-label={`Calories for ${itemName}`}
<<<<<<< HEAD
          className="flex-1 h-10 border border-border-app rounded-lg px-2.5 bg-[#fafafa] text-text-app text-sm outline-none"
        />
      </div>
      <div className="flex items-center mb-2.5">
        <span className="w-[100px] text-[13px] text-text-light">Protein (g)</span>
=======
          className={inputClass}
        />
      </div>
      <div className={rowClass}>
        <span className={labelClass}>Protein (g)</span>
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
        <input
          type="number"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          placeholder="0"
          aria-label={`Protein grams for ${itemName}`}
<<<<<<< HEAD
          className="flex-1 h-10 border border-border-app rounded-lg px-2.5 bg-[#fafafa] text-text-app text-sm outline-none"
        />
      </div>
      <div className="flex items-center mb-2.5">
        <span className="w-[100px] text-[13px] text-text-light">Carbs (g)</span>
=======
          className={inputClass}
        />
      </div>
      <div className={rowClass}>
        <span className={labelClass}>Carbs (g)</span>
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
        <input
          type="number"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          placeholder="0"
          aria-label={`Carbs grams for ${itemName}`}
<<<<<<< HEAD
          className="flex-1 h-10 border border-border-app rounded-lg px-2.5 bg-[#fafafa] text-text-app text-sm outline-none"
        />
      </div>
      <div className="flex items-center mb-2.5">
        <span className="w-[100px] text-[13px] text-text-light">Fat (g)</span>
=======
          className={inputClass}
        />
      </div>
      <div className={rowClass}>
        <span className={labelClass}>Fat (g)</span>
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
        <input
          type="number"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          placeholder="0"
          aria-label={`Fat grams for ${itemName}`}
<<<<<<< HEAD
          className="flex-1 h-10 border border-border-app rounded-lg px-2.5 bg-[#fafafa] text-text-app text-sm outline-none"
=======
          className={inputClass}
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
        />
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={handleSave}
          aria-label={`Save nutrition for ${itemName}`}
<<<<<<< HEAD
          className="h-11 rounded-lg bg-primary text-white font-semibold border-none active:scale-[0.98] transition-transform"
=======
          className="h-11 rounded-xl bg-[#4CAF50] text-white font-semibold border-none"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
        >
          Save
        </button>
        <button
          type="button"
          onClick={onSkip}
          aria-label={`Skip and log ${itemName} without nutrition`}
<<<<<<< HEAD
          className="h-11 rounded-lg bg-transparent text-text-light border border-border-app active:scale-[0.98] transition-transform"
=======
          className="h-11 rounded-xl bg-transparent text-[#666666] border border-[#E0E0E0]"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
        >
          Skip — log without nutrition
        </button>
      </div>
    </div>
  );
}
