"use client";

import { FC } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { RankingChartRow } from "@/lib/dashboard/ranking";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/** 棒の色 (RGB)。枠線は不透明、塗りは半透明で使う */
const BAR_COLORS = {
  rose: "255, 99, 132",
  blue: "53, 162, 235",
  teal: "75, 192, 192",
  amber: "255, 206, 86",
} as const;

export type RankingBarColor = keyof typeof BAR_COLORS;

type Props = {
  /** グラフ上部に出すタイトル */
  title: string;
  /** 凡例に出す系列名 (単位込み) */
  label: string;
  color: RankingBarColor;
  /** 上位から順に並んだ行 */
  rows: RankingChartRow[];
};

/** 横棒のランキンググラフ。集計は lib/dashboard/ranking で済ませてから渡す */
export const RankingBarChart: FC<Props> = ({ title, label, color, rows }) => {
  const options = {
    indexAxis: "y" as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  const data = {
    labels: rows.map((row) => row.label),
    datasets: [
      {
        label,
        data: rows.map((row) => row.value),
        borderColor: `rgb(${BAR_COLORS[color]})`,
        backgroundColor: `rgba(${BAR_COLORS[color]}, 0.5)`,
      },
    ],
  };

  return (
    <div className="p-3 w-full rounded-md relative h-96">
      <Bar options={options} data={data} />
    </div>
  );
};
