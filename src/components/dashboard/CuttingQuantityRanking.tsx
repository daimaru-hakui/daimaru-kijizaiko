import React, { useEffect, useState } from "react";
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
import { Box } from "@chakra-ui/react";
import { CuttingHistoryType } from "../../../types/CuttingHistoryType";
import { CuttingReportType } from "../../../types/CuttingReportType";
import { CuttingProductType } from "../../../types/CuttingProductType";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { NextPage } from "next";

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
};

const CuttingQuantityRanking: NextPage<Props> = ({
  data,
  startDay,
  endDay,
  rankingNumber,
}) => {
  const { getProductNumber, getColorName } = useGetDisp();
  const [chartDataList, setChartDataList] = useState([
    { productId: "", quantity: 0, price: 0 },
  ]);

  useEffect(() => {
    const getArray = () => {
      const filterArray = data?.map((obj: CuttingReportType) => obj.products.map(
        (product: CuttingProductType) => (
          {
            ...obj,
            ...product,
            products: null,
          } as CuttingHistoryType)
      )
      ).flat().filter((obj) => (
        new Date(startDay).getTime() <= new Date(obj.cuttingDate).getTime() &&
        new Date(obj.cuttingDate).getTime() <= new Date(endDay).getTime())
      );

      const ProductIds = filterArray?.map((obj: { productId: string; }) => obj.productId);
      const headersObj = new Set(ProductIds);
      const headers = Array.from(headersObj);

      const newArray = headers.map((header: any) => {
        let sum = 0;
        filterArray?.forEach((obj: { productId: string; quantity: number; }) => {
          if (obj.productId === header) {
            sum += obj.quantity;
          }
        });
        return { productId: header, quantity: sum };
      });
      const result: any = newArray.sort((a, b) => {
        if (a.quantity > b.quantity) {
          return -1;
        }
      });
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
      (ranking: { productId: string; }) =>
        `${getProductNumber(ranking.productId)} ${getColorName(
          ranking.productId
        )}`
    );

  const dataList = {
    labels,
    datasets: [
      {
        label: "使用数量（ｍ）",
        data: chartDataList
          ?.slice(0, rankingNumber)
          ?.map((ranking: { quantity: number; }) => ranking.quantity),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <Box p={3} w="100%" h="100%" rounded="md">
      <Bar options={options} data={dataList} />
    </Box>
  );
};

export default CuttingQuantityRanking;
