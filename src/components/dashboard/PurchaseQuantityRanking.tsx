"use client";

import { useEffect, useState, FC } from "react";
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
import { History } from "../../../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  data: Omit<History, 'createdAt' | 'updatedAt'>[];
  startDay: string;
  endDay: string;
  rankingNumber: number;
  productsMap: Record<string, { productNumber: string; colorName: string }>;
};

export const PurchaseQuantityRanking: FC<Props> = ({
  data,
  startDay,
  endDay,
  rankingNumber,
  productsMap,
}) => {
  const [chartDataList, setChartDataList] = useState<{ productId: string; quantity: number }[]>([]);

  useEffect(() => {
    const getArray = async () => {
      const ProductIds = data?.map((obj) => obj.productId);
      const headersObj = new Set(ProductIds);
      const headers = Array.from(headersObj);

      const newArray = headers.map((header) => {
        const filterData = data?.filter(
          (obj) =>
            new Date(startDay).getTime() <= new Date(obj.fixedAt).getTime() &&
            new Date(obj.fixedAt).getTime() <= new Date(endDay).getTime()
        );

        let sum = 0;
        filterData.forEach((obj) => {
          if (obj.productId === header) {
            sum += obj.quantity;
          }
        });
        return { productId: header, quantity: sum };
      });

      const result = [...newArray].sort((a, b) => b.quantity - a.quantity);
      setChartDataList(result);
    };
    getArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, rankingNumber, startDay, endDay]);

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
        text: "生地購入数量ランキング",
      },
    },
  };

  const labels = chartDataList
    ?.slice(0, rankingNumber)
    ?.map(
      (ranking) =>
        `${productsMap[ranking.productId]?.productNumber ?? ranking.productId} ${productsMap[ranking.productId]?.colorName ?? ''}`
    );

  const dataList = {
    labels,
    datasets: [
      {
        label: "購入数量（ｍ）",
        data: chartDataList
          ?.slice(0, rankingNumber)
          ?.map((ranking) => ranking.quantity),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  return (
    <div className="p-3 w-full rounded-md relative h-96">
      <Bar options={options} data={dataList} />
    </div>
  );
};
