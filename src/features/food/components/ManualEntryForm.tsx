import { useState } from 'react';
import { colors } from '../constants/colors';

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

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 10,
  };
  const labelStyle: React.CSSProperties = {
    width: 100,
    fontSize: 13,
    color: colors.textLight,
  };
  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: 40,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '0 10px',
    background: '#fafafa',
    color: colors.text,
    fontSize: 14,
  };

  return (
    <div
      style={{
        background: colors.card,
        borderRadius: 12,
        padding: 16,
        margin: '8px 0',
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
        Add nutrition for: {itemName}
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Calories</span>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="0"
          aria-label={`Calories for ${itemName}`}
          style={inputStyle}
        />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Protein (g)</span>
        <input
          type="number"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          placeholder="0"
          aria-label={`Protein grams for ${itemName}`}
          style={inputStyle}
        />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Carbs (g)</span>
        <input
          type="number"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          placeholder="0"
          aria-label={`Carbs grams for ${itemName}`}
          style={inputStyle}
        />
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Fat (g)</span>
        <input
          type="number"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          placeholder="0"
          aria-label={`Fat grams for ${itemName}`}
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={handleSave}
          aria-label={`Save nutrition for ${itemName}`}
          style={{
            height: 44,
            borderRadius: 10,
            background: colors.primary,
            color: '#fff',
            fontWeight: 600,
            border: 'none',
          }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onSkip}
          aria-label={`Skip and log ${itemName} without nutrition`}
          style={{
            height: 44,
            borderRadius: 10,
            background: 'transparent',
            color: colors.textLight,
            border: `1px solid ${colors.border}`,
          }}
        >
          Skip — log without nutrition
        </button>
      </div>
    </div>
  );
}
