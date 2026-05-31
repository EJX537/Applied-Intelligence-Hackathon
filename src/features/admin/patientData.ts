// ── Single source of truth for patient data ──
// Used by both the Admin Dashboard and the user-facing homepage mock.
// Admin sees all patients; the homepage scopes to the current user.

import type { Patient } from './types'

export const patients: Patient[] = [
  {
    id: 'PT-001', name: 'Maria Santos', age: 52, sex: 'F', color: '#FF6B6B',
    dx: 'Type 2 Diabetes, Hypertension',
    checkpoints: {
      baseline: { labs: 48, steps: 40, diet: 42, oral: 55,  labNote: 'HbA1c 7.2%, LDL 138', stepsNote: '~3,800 steps/day', dietNote: 'High processed food', oralNote: 'Brushes once/day' },
      '3mo':    { labs: 62, steps: 61, diet: 63, oral: 72,  labNote: 'HbA1c 6.8%, LDL 121', stepsNote: '~6,100 steps/day', dietNote: 'Reduced soda, more veg', oralNote: 'Brushes 2×/day' },
      '6mo':    { labs: 74, steps: 76, diet: 75, oral: 85,  labNote: 'HbA1c 6.3%, LDL 108', stepsNote: '~7,600 steps/day', dietNote: 'Meal prepping, low-glycemic', oralNote: 'Daily brushing & flossing' },
    },
  },
  {
    id: 'PT-002', name: 'James Liu', age: 44, sex: 'M', color: '#007AFF',
    dx: 'Hyperlipidemia, Pre-diabetes',
    checkpoints: {
      baseline: { labs: 55, steps: 52, diet: 50, oral: 60,  labNote: 'HbA1c 6.1%, LDL 145', stepsNote: '~5,200 steps/day', dietNote: 'Frequent fast food', oralNote: 'Brushes once/day' },
      '3mo':    { labs: 63, steps: 66, diet: 68, oral: 70,  labNote: 'HbA1c 5.9%, LDL 130', stepsNote: '~6,600 steps/day', dietNote: 'Cooking at home 4×/wk', oralNote: 'Brushes 2×/day + mouthwash' },
      '6mo':    { labs: 72, steps: 80, diet: 79, oral: 80,  labNote: 'HbA1c 5.7%, LDL 115', stepsNote: '~8,000 steps/day', dietNote: 'Mediterranean-style diet', oralNote: 'Brushes 2×/day, flosses 5×/wk' },
    },
  },
  {
    id: 'PT-003', name: 'Aisha Johnson', age: 38, sex: 'F', color: '#34C759',
    dx: 'Obesity, Elevated CRP',
    checkpoints: {
      baseline: { labs: 50, steps: 35, diet: 38, oral: 45,  labNote: 'CRP 4.2, LDL 142', stepsNote: '~3,500 steps/day', dietNote: 'Irregular meals, high sugar', oralNote: 'Brushes irregularly' },
      '3mo':    { labs: 68, steps: 65, diet: 70, oral: 62,  labNote: 'CRP 2.8, LDL 128', stepsNote: '~6,500 steps/day', dietNote: '3 structured meals/day', oralNote: 'Brushes daily' },
      '6mo':    { labs: 82, steps: 88, diet: 85, oral: 78,  labNote: 'CRP 1.4, LDL 109', stepsNote: '~8,800 steps/day', dietNote: 'Whole foods, limited processed', oralNote: 'Brushes 2×/day, improving floss' },
    },
  },
  {
    id: 'PT-004', name: 'Robert Kim', age: 61, sex: 'M', color: '#FF9500',
    dx: 'Hypertension, CKD Stage 2',
    checkpoints: {
      baseline: { labs: 42, steps: 30, diet: 44, oral: 50,  labNote: 'BP 148/92, Creat 1.4', stepsNote: '~3,000 steps/day', dietNote: 'High sodium diet', oralNote: 'Brushes once/day' },
      '3mo':    { labs: 50, steps: 42, diet: 53, oral: 58,  labNote: 'BP 140/88, Creat 1.3', stepsNote: '~4,200 steps/day', dietNote: 'Reducing sodium, more fruit', oralNote: 'Brushes 2×/day' },
      '6mo':    { labs: 55, steps: 48, diet: 60, oral: 62,  labNote: 'BP 135/84, Creat 1.2', stepsNote: '~4,800 steps/day', dietNote: 'DASH diet, partial compliance', oralNote: 'Brushes 2×/day, mouthwash' },
    },
  },
  {
    id: 'PT-005', name: 'Elena Rodriguez', age: 47, sex: 'F', color: '#AF52DE',
    dx: 'Hypothyroidism, Anemia',
    checkpoints: {
      baseline: { labs: 52, steps: 45, diet: 58, oral: 65,  labNote: 'TSH 6.2, Hgb 10.8', stepsNote: '~4,500 steps/day', dietNote: 'Low iron foods', oralNote: 'Brushes 2×/day, occ floss' },
      '3mo':    { labs: 66, steps: 60, diet: 72, oral: 75,  labNote: 'TSH 3.8, Hgb 12.1', stepsNote: '~6,000 steps/day', dietNote: 'Iron-rich foods added', oralNote: 'Brushes 2×/day, floss 3×/wk' },
      '6mo':    { labs: 78, steps: 73, diet: 80, oral: 85,  labNote: 'TSH 2.6, Hgb 13.2', stepsNote: '~7,300 steps/day', dietNote: 'Balanced, cooking at home', oralNote: 'Daily brushing & flossing' },
    },
  },
  {
    id: 'PT-006', name: 'David Chen', age: 55, sex: 'M', color: '#32ADE6',
    dx: 'Metabolic Syndrome',
    checkpoints: {
      baseline: { labs: 46, steps: 38, diet: 40, oral: 48,  labNote: 'Trig 220, Glucose 108', stepsNote: '~3,800 steps/day', dietNote: 'High carb, low fiber', oralNote: 'Brushes once/day' },
      '3mo':    { labs: 58, steps: 55, diet: 60, oral: 65,  labNote: 'Trig 175, Glucose 101', stepsNote: '~5,500 steps/day', dietNote: 'Reducing carbs, adding fiber', oralNote: 'Brushes 2×/day' },
      '6mo':    { labs: 68, steps: 67, diet: 72, oral: 75,  labNote: 'Trig 145, Glucose 96',  stepsNote: '~6,700 steps/day', dietNote: 'Low-carb structured eating', oralNote: 'Brushes 2×/day, floss 4×/wk' },
    },
  },
  {
    id: 'PT-007', name: 'Priya Nair', age: 34, sex: 'F', color: '#5856D6',
    dx: 'PCOS, Vitamin D Deficiency',
    checkpoints: {
      baseline: { labs: 54, steps: 48, diet: 55, oral: 70,  labNote: 'Vit D 14 ng/mL, HbA1c 5.8%', stepsNote: '~4,800 steps/day', dietNote: 'Inconsistent eating', oralNote: 'Good oral habits' },
      '3mo':    { labs: 70, steps: 72, diet: 74, oral: 82,  labNote: 'Vit D 28 ng/mL, HbA1c 5.6%', stepsNote: '~7,200 steps/day', dietNote: 'Anti-inflammatory diet', oralNote: 'Excellent oral care' },
      '6mo':    { labs: 84, steps: 88, diet: 87, oral: 90,  labNote: 'Vit D 42 ng/mL, HbA1c 5.4%', stepsNote: '~8,800 steps/day', dietNote: 'Whole food, plant-rich', oralNote: 'Exemplary oral hygiene' },
    },
  },
  {
    id: 'PT-008', name: 'Marcus Thompson', age: 58, sex: 'M', color: '#FF3B30',
    dx: 'Coronary Artery Disease Risk',
    checkpoints: {
      baseline: { labs: 40, steps: 28, diet: 35, oral: 42,  labNote: 'LDL 165, hs-CRP 5.1', stepsNote: '~2,800 steps/day', dietNote: 'High sat fat, smoking', oralNote: 'Poor brushing habits' },
      '3mo':    { labs: 47, steps: 38, diet: 44, oral: 52,  labNote: 'LDL 152, hs-CRP 4.2', stepsNote: '~3,800 steps/day', dietNote: 'Reduced red meat, quit smoking', oralNote: 'Brushes daily now' },
      '6mo':    { labs: 56, steps: 50, diet: 58, oral: 62,  labNote: 'LDL 138, hs-CRP 2.9', stepsNote: '~5,000 steps/day', dietNote: 'Heart-healthy diet', oralNote: 'Brushes 2×/day' },
    },
  },
  // ── Sarah (homepage user) mapped to the same data model ──
  // Lab values sourced from Maria Santos baseline for consistency
  // between patient-facing and admin views.
  {
    id: 'PT-009', name: 'Sarah Johnson', age: 35, sex: 'F', color: '#34C759',
    dx: 'Preventive Health',
    checkpoints: {
      baseline: { labs: 48, steps: 82, diet: 0, oral: 0,  labNote: 'HbA1c 7.2%, LDL 138, BP 148/92', stepsNote: '~8,420 steps/day', dietNote: 'Not yet assessed', oralNote: 'Not yet assessed' },
      '3mo':    { labs: 0, steps: 0, diet: 0, oral: 0,  labNote: '', stepsNote: '', dietNote: '', oralNote: '' },
      '6mo':    { labs: 0, steps: 0, diet: 0, oral: 0,  labNote: '', stepsNote: '', dietNote: '', oralNote: '' },
    },
  },
]
