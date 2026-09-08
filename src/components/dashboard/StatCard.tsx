import { FC } from "react";

const accentColors: Record<string, string> = {
  blue:    "bg-blue-800",
  emerald: "bg-emerald-600",
  violet:  "bg-violet-600",
  cyan:    "bg-cyan-600",
  amber:   "bg-amber-500",
  rose:    "bg-rose-500",
  default: "bg-slate-400",
};

type Props = {
  title: string;
  quantity: string | number;
  unit: string;
  fontSize: string;
  color?: string;
};

export const StatCard: FC<Props> = ({ title, quantity, unit, fontSize, color = "default" }) => {
  const accent = accentColors[color] ?? accentColors.default;
  return (
    <div className="relative flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className={`absolute inset-y-0 left-0 w-1.5 rounded-l-xl ${accent}`} />
      <p className="pl-2 text-[11px] font-semibold text-slate-400 tracking-[0.12em] uppercase leading-none">
        {title}
      </p>
      <p className={`pl-2 mt-3 font-bold tabular-nums text-slate-900 leading-none ${fontSize === "4xl" ? "text-4xl" : "text-3xl"}`}>
        {quantity}
        <span className="text-sm font-normal text-slate-400 ml-1.5">{unit}</span>
      </p>
    </div>
  );
};
