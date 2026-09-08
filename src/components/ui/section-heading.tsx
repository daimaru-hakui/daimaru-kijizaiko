export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.18em] uppercase whitespace-nowrap">
        {children}
      </h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}
