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
import {
  CuttingReportType,
  CuttingHistoryType,
  CuttingProductType,
} from "../../../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  data: CuttingReportType[];
  startDay: string;
  endDay: string;
  rankingNumber: number;
  productsMap: Record<string, { productNumber: string; colorName: string }>;
};

export const CuttingQuantityRanking: FC<Props> = ({
  data,
  startDay,
  endDay,
  rankingNumber,
  productsMap,
}) => {
  const [chartDataList, setChartDataList] = useState<{ productId: string; quantity: number }[]>([]);

  useEffect(() => {
    const getArray = () => {
      const filterArray = data
        ?.map((obj: CuttingReportType) =>
          obj.products.map(
            (product: CuttingProductType) =>
              ({
                ...obj,
                ...product,
                products: null,
              } as CuttingHistoryType)
          )
        )
        .flat()
        .filter(
          (obj) =>
            new Date(startDay).getTime() <=
              new Date(obj.cuttingDate).getTime() &&
            new Date(obj.cuttingDate).getTime() <= new Date(endDay).getTime()
        );

      const ProductIds = filterArray?.map(
        (obj: { productId: string }) => obj.productId
      );
      const headersObj = new Set(ProductIds);
      const headers = Array.from(headersObj);

      const newArray = headers.map((header: any) => {
        let sum = 0;
        filterArray?.forEach((obj: { productId: string; quantity: number }) => {
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
        text: "生地使用数量ランキング",
      },
    },
  };

  const labels = chartDataList
    ?.slice(0, rankingNumber)
    ?.map(
      (ranking: { productId: string }) =>
        `${productsMap[ranking.productId]?.productNumber ?? ranking.productId} ${productsMap[ranking.productId]?.colorName ?? ''}`
    );

  const dataList = {
    labels,
    datasets: [
      {
        label: "使用数量（ｍ）",
        data: chartDataList
          ?.slice(0, rankingNumber)
          ?.map((ranking: { quantity: number }) => ranking.quantity),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="p-3 w-full rounded-md relative h-96">
      <Bar options={options} data={dataList} />
    </div>
  );
};
