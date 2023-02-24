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
import { useRecoilValue } from "recoil";
import { fabricPurchaseConfirmsState } from "../../../store";
import { Box } from "@chakra-ui/react";
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
  startAt: string;
  endAt: string;
  rankingNumber: number;
};

const PurchaseQuantityRanking: NextPage<Props> = ({
  startAt,
  endAt,
  rankingNumber,
}) => {
  const fabricPurchaseConfirms = useRecoilValue(fabricPurchaseConfirmsState);
  const { getProductNumber, getColorName, getPrice } = useGetDisp();
  const [chartDataList, setChartDataList] = useState([
    { productId: "", quantity: 0 },
  ]);

  useEffect(() => {
    const getArray = async () => {
      const filterArray = fabricPurchaseConfirms.filter(
        (obj: { fixedAt: string }) =>
          new Date(obj.fixedAt).getTime() >= new Date(startAt).getTime() &&
          new Date(obj.fixedAt).getTime() <= new Date(endAt).getTime()
      );

      const ProductIds = filterArray.map((obj) => obj.productId);
      const headersObj = new Set(ProductIds);
      const headers = Array.from(headersObj);

      const newArray = headers.map((header: string) => {
        let sum = 0;
        let productId = "";
        filterArray.forEach((obj: { productId: string; quantity: number }) => {
          if (obj.productId === header) {
            sum += obj.quantity;
            productId = obj.productId;
          }
        });
        return { productId, quantity: sum };
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
  }, [fabricPurchaseConfirms, startAt, endAt]);

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
      (ranking: { productId: string }) =>
        `${getProductNumber(ranking.productId)} ${getColorName(
          ranking.productId
        )}`
    );

  const data = {
    labels,
    datasets: [
      {
        label: "購入数量（ｍ）",
        data: chartDataList
          ?.slice(0, rankingNumber)
          ?.map((ranking: { quantity: number }) => ranking.quantity),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  return (
    <Box p={3} bg="white" w="100%" h="100%" rounded="md">
      <Bar options={options} data={data} />
    </Box>
  );
};

export default PurchaseQuantityRanking;