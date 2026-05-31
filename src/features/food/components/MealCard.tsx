import type { MealEntry } from '../types';
import { colors } from '../constants/colors';

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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: colors.card,
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
      }}
    >
      <span style={{ fontSize: 28 }}>{MEAL_ICONS[meal.meal_type]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>
          {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
        </div>
        <div style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>
          {formatTime(meal.timestamp)} · {meal.items.length} item
          {meal.items.length === 1 ? '' : 's'}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>
          {meal.meal_total.calories} kcal
        </span>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${meal.meal_type}`}
          style={{
            color: colors.danger,
            background: 'transparent',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 8px',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
