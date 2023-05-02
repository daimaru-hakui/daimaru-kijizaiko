import React, { useEffect, useState, FC } from "react";
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
import { useGetDisp } from "../../hooks/UseGetDisp";
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
  data: History[];
  startDay: string;
  endDay: string;
  rankingNumber: number;
};

export const PurchaseQuantityRanking: FC<Props> = ({
  data,
  startDay,
  endDay,
  rankingNumber,
}) => {
  const { getProductNumber, getColorName } = useGetDisp();
  const [chartDataList, setChartDataList] = useState([
    { productId: "", quantity: 0 },
  ]);

  useEffect(() => {
    const getArray = async () => {
      const ProductIds = data?.map((obj) => obj.productId);
      const headersObj = new Set(ProductIds);
      const headers = Array.from(headersObj);

      const newArray = headers.map((header) => {
        const filterData = data?.filter(
          (obj) =>
            new Date(startDay).getTime() < new Date(obj.fixedAt).getTime() &&
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

      const result = newArray.sort((a, b) => {
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
        text: "生地購入数量ランキング",
      },
    },
  };

  const labels = chartDataList
    ?.slice(0, rankingNumber)
    ?.map(
      (ranking) =>
        `${getProductNumber(ranking.productId)} ${getColorName(
          ranking.productId
        )}`
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
    <Box p={3} bg="white" w="100%" h="100%" rounded="md">
      <Bar options={options} data={dataList} />
    </Box>
  );
};
