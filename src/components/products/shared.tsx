export type InlineStatProps = {
  label: string;
  value: number;
  unit: string;
  danger?: boolean;
};

export function InlineStat({ label, value, unit, danger }: InlineStatProps) {
  const isZero = value === 0;
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <span className="text-xs text-slate-600 leading-none">{label}</span>
      <span
        className={`text-sm font-semibold leading-snug ${
          danger ? "text-red-600" : isZero ? "text-slate-300" : "text-slate-800"
        }`}
      >
        {value.toLocaleString()}
        {unit}
      </span>
    </div>
  );
}

export type ChipProps = {
  label: string;
  variant?: "default" | "indigo" | "slate";
};

export function Chip({ label, variant = "default" }: ChipProps) {
  const styles = {
    default: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    slate: "bg-slate-100 text-slate-600 border border-slate-200",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs ${styles[variant]}`}>
      {label}
    </span>
  );
}
