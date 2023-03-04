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

const CuttingPriceRanking: NextPage<Props> = ({
  data,
  startDay,
  endDay,
  rankingNumber,
}) => {
  const { getProductNumber, getColorName, getPrice } = useGetDisp();
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
            price: getPrice(product.productId),
            products: null,
          } as CuttingHistoryType & { price: number; })
      )
      ).flat().filter((obj) => (
        new Date(startDay).getTime() <= new Date(obj.cuttingDate).getTime() &&
        new Date(obj.cuttingDate).getTime() <= new Date(endDay).getTime())
      );

      const ProductIds = filterArray?.map((obj: { productId: string; }) => obj.productId);
      const headersObj = new Set(ProductIds);
      const headers = Array.from(headersObj);

      const newArray = headers.map((header: string) => {
        let sum = 0;
        filterArray?.forEach((obj: { productId: string; quantity: number; price: number; }) => {
          if (obj.productId === header) {
            sum += obj.quantity * (obj.price || getPrice(header));
          }
        });
        return { productId: header, price: sum };
      });
      console.log(newArray);
      const result: any = newArray.sort((a, b) => {
        if (a.price > b.price) {
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
        text: "生地使用金額ランキング",
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
    labels: labels,
    datasets: [
      {
        label: "使用金額（円）",
        data: chartDataList
          ?.slice(0, rankingNumber)
          ?.map((ranking: { price: number; }) => ranking.price.toFixed()),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <Box p={3} w="100%" h="100%" rounded="md">
      <Bar options={options} data={dataList} />
    </Box>
  );
};

export default CuttingPriceRanking;
