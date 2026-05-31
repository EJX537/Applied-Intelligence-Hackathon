import type { MealEntry } from '../types';

interface Props {
  meal: MealEntry;
  onDelete: (id: string) => void;
}

const MEAL_ICONS: Record<MealEntry['meal_type'], string> = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍽',
  snack: '🍎',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function MealCard({ meal, onDelete }: Props) {
  const handleDelete = () => {
    if (window.confirm("Remove this meal from today's log?")) {
      onDelete(meal.id);
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex items-center bg-card-app p-3 rounded-xl mb-2 gap-3">
      <span className="text-[28px]">{MEAL_ICONS[meal.meal_type]}</span>
      <div className="flex-1">
        <div className="text-base font-semibold text-text-app">
          {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
        </div>
        <div className="text-xs text-text-light mt-0.5">
=======
    <div className="flex items-center gap-3 bg-white p-3 rounded-xl mb-2">
      <span className="text-[28px]">{MEAL_ICONS[meal.meal_type]}</span>
      <div className="flex-1">
        <div className="text-base font-semibold text-[#333333]">
          {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
        </div>
        <div className="text-xs text-[#666666] mt-0.5">
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
          {formatTime(meal.timestamp)} · {meal.items.length} item
          {meal.items.length === 1 ? '' : 's'}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
<<<<<<< HEAD
        <span className="text-sm font-bold text-primary">
=======
        <span className="text-sm font-bold text-[#4CAF50]">
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
          {meal.meal_total.calories} kcal
        </span>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${meal.meal_type}`}
<<<<<<< HEAD
          className="text-danger bg-transparent border-none text-xs font-semibold py-1 px-2 cursor-pointer active:scale-[0.95] transition-transform"
=======
          className="text-[#F44336] bg-transparent border-none text-xs font-semibold px-2 py-1"
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
        >
          Delete
        </button>
      </div>
    </div>
  );
}
