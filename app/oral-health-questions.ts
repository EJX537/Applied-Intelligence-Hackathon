export type OralHealthOption = {
  label: string;
  points: number;
};

export type OralHealthQuestion = {
  id: string;
  question: string;
  type: "single_choice";
  options: OralHealthOption[];
};

export const ORAL_HEALTH_DAILY_WEIGHT = 0.15;

export const ORAL_HEALTH_QUESTIONS: OralHealthQuestion[] = [
  {
    id: "brushing_frequency",
    question: "How many times did you brush your teeth today?",
    type: "single_choice",
    options: [
      { label: "0", points: 0 },
      { label: "1", points: 20 },
      { label: "2 or more", points: 40 },
    ],
  },
  {
    id: "fluoride_toothpaste",
    question: "Did you use fluoride toothpaste when brushing today?",
    type: "single_choice",
    options: [
      { label: "Yes", points: 20 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "interdental_cleaning",
    question: "Did you floss or use another interdental cleaner today?",
    type: "single_choice",
    options: [
      { label: "Yes", points: 20 },
      { label: "No", points: 0 },
    ],
  },
  {
    id: "sugary_drinks",
    question: "How many sugary drinks did you have today?",
    type: "single_choice",
    options: [
      { label: "0", points: 10 },
      { label: "1", points: 7 },
      { label: "2", points: 3 },
      { label: "3 or more", points: 0 },
    ],
  },
];

export const ORAL_HEALTH_MAX_POINTS = ORAL_HEALTH_QUESTIONS.reduce(
  (max, question) =>
    max + Math.max(...question.options.map((option) => option.points)),
  0,
);

export function calculateOralHealthScore(
  answers: Record<string, string>,
): { rawPoints: number; scoreOutOf100: number; dailyContribution: number } {
  const rawPoints = ORAL_HEALTH_QUESTIONS.reduce((total, question) => {
    const selectedLabel = answers[question.id];
    const option = question.options.find((o) => o.label === selectedLabel);
    return total + (option?.points ?? 0);
  }, 0);

  const scoreOutOf100 =
    ORAL_HEALTH_MAX_POINTS === 0
      ? 0
      : Math.round((rawPoints / ORAL_HEALTH_MAX_POINTS) * 100);

  const dailyContribution =
    Math.round(scoreOutOf100 * ORAL_HEALTH_DAILY_WEIGHT * 10) / 10;

  return { rawPoints, scoreOutOf100, dailyContribution };
}
