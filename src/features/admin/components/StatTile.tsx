export function StatTile({
  icon,
  value,
  label,
  colorClass,
}: {
  icon: string
  value: string
  label: string
  colorClass: string
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-3.5 pb-3">
      <div className="mb-1.5 text-[22px] leading-none">{icon}</div>
      <div className={`text-[26px] font-extrabold leading-none ${colorClass}`}>{value}</div>
      <div className="mt-0.5 text-xs text-slate-400">{label}</div>
    </div>
  )
}
