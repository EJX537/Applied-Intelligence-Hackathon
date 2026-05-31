export interface Section {
  id: string;
  title: string;
  subtitle: string;
  weight: string;
  status: "logged" | "pending" | "incomplete";
  score: number | null;
  detail: string;
  accent: "sky" | "amber" | "violet" | "emerald";
  icon: string;
}

export const SECTIONS: Section[] = [
  {
    id: "steps",
    title: "Step Counts",
    subtitle: "Daily · sync or manual entry",
    weight: "30% of daily score",
    status: "logged",
    score: 82,
    detail: "8,420 steps today",
    accent: "sky",
    icon: "steps",
  },
  {
    id: "lab",
    title: "Lab Data",
    subtitle: "Every 3 months · from provider",
    weight: "Month 3 & 6 review",
    status: "pending",
    score: null,
    detail: "Next lab due in 12 days",
    accent: "amber",
    icon: "lab",
  },
  {
    id: "oral",
    title: "Oral Health",
    subtitle: "Daily questions",
    weight: "15% of daily score",
    status: "incomplete",
    score: null,
    detail: "4 questions · not started",
    accent: "violet",
    icon: "oral",
  },
  {
    id: "food",
    title: "Food & Diet",
    subtitle: "Photo upload · AI nutrition analysis",
    weight: "35% of daily score",
    status: "incomplete",
    score: null,
    detail: "Upload meal photos · not started",
    accent: "emerald",
    icon: "food",
  },
];

export const accentStyles: Record<
  string,
  { icon: string; ring: string; badge: string }
> = {
  sky: {
    icon: "bg-sky-500 text-white",
    ring: "ring-sky-100",
    badge: "bg-sky-100 text-sky-700",
  },
  amber: {
    icon: "bg-amber-500 text-white",
    ring: "ring-amber-100",
    badge: "bg-amber-100 text-amber-800",
  },
  violet: {
    icon: "bg-violet-500 text-white",
    ring: "ring-violet-100",
    badge: "bg-violet-100 text-violet-700",
  },
  emerald: {
    icon: "bg-emerald-500 text-white",
    ring: "ring-emerald-100",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

export function SectionIcon({ type }: { type: string }) {
  const cls = "h-6 w-6";
  switch (type) {
    case "steps":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 16l4-6 4 3 4-7 4 5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="4" cy="16" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="20" cy="11" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "lab":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M9 3h6v7l4 10H5L9 10V3z" strokeLinejoin="round" />
          <path d="M9 3h6" strokeLinecap="round" />
        </svg>
      );
    case "oral":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
        </svg>
      );
    case "food":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 2C8 6 6 10 6 14a6 6 0 0012 0c0-4-2-8-6-12z" strokeLinejoin="round" />
          <path d="M12 12v6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function StatusPill({ status }: { status: string }) {
  if (status === "logged") {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        Done
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
        Upcoming
      </span>
    );
  }
  return (
    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
      To do
    </span>
  );
}
