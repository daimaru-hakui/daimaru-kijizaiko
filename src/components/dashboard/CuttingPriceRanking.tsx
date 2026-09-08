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
import { Product, CuttingReportType } from "../../../types";
import { getProductsAction } from "@/app/(app)/products/actions";

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

export const CuttingPriceRanking: FC<Props> = ({
  data,
  startDay,
  endDay,
  rankingNumber,
  productsMap,
}) => {
  const [chartDataList, setChartDataList] = useState<{ productId: string; price: number }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProductsAction().then((result) => {
      if (result.ok) setProducts(result.contents);
    });
  }, []);

  useEffect(() => {
    const getPrice = (productId: string) => {
      const product = products.find((p) => p.id === productId);
      return product?.price || 0;
    };

    const getArray = async () => {
      const filterArray = data
        ?.map((obj) =>
          obj.products.map((product) => ({
            ...obj,
            ...product,
            price: getPrice(product?.productId) || 0,
            products: null,
          }))
        )
        .flat()
        .filter(
          (obj) =>
            new Date(startDay).getTime() <=
              new Date(obj.cuttingDate).getTime() &&
            new Date(obj.cuttingDate).getTime() <= new Date(endDay).getTime()
        );

      const ProductIds = filterArray?.map((obj) => obj.productId);
      const headersObj = new Set(ProductIds);
      const headers = Array.from(headersObj);

      const newArray = headers.map((header: string) => {
        let sum = 0;
        filterArray?.forEach((obj) => {
          if (obj.productId === header) {
            sum += obj.quantity * (obj.price || getPrice(header) || 0);
          }
        });
        return { productId: header, price: sum };
      });

      const result = [...newArray].sort((a, b) => b.price - a.price);
      setChartDataList(result);
    };
    getArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, rankingNumber, startDay, endDay, products]);

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
        text: "生地使用金額ランキング",
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
    labels: labels,
    datasets: [
      {
        label: "使用金額（円）",
        data: chartDataList
          ?.slice(0, rankingNumber)
          ?.map((ranking) => ranking.price.toFixed()),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div className="p-3 w-full rounded-md relative h-96">
      <Bar options={options} data={dataList} />
    </div>
  );
};