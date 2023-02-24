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
import { cuttingReportsState } from "../../../store";
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
  startAt: string;
  endAt: string;
  rankingNumber: number;
};

const CuttingPriceRanking: NextPage<Props> = ({
  startAt,
  endAt,
  rankingNumber,
}) => {
  const cuttingReports = useRecoilValue(cuttingReportsState);
  const { getProductNumber, getColorName, getPrice } = useGetDisp();
  const [chartDataList, setChartDataList] = useState([
    { productId: "", quantity: 0, price: 0 },
  ]);

  useEffect(() => {
    const getArray = async () => {
      const filterArray = cuttingReports
        .map((obj: CuttingReportType) =>
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
          (obj: { cuttingDate: string }) =>
            new Date(obj.cuttingDate).getTime() >=
              new Date(startAt).getTime() &&
            new Date(obj.cuttingDate).getTime() <= new Date(endAt).getTime()
        );

      const ProductIds = filterArray.map((obj) => obj.productId);
      const headersObj = new Set(ProductIds);
      const headers = Array.from(headersObj);

      const newFilterArray = headers.map((header: any) =>
        filterArray.filter((report: any) => header === report.productId)
      );

      const newArray = newFilterArray.map((reports: any) => {
        let sum = 0;
        let productId = "";
        let price = 0;
        reports?.forEach((report: { productId: string; quantity: number }) => {
          sum += report.quantity;
          productId = report.productId;
          price += report.quantity * getPrice(report.productId);
        });
        return { productId, quantity: sum, price };
      });
      const result = newArray.sort((a, b) => {
        if (a.price > b.price) {
          return -1;
        }
      });
      setChartDataList(result);
    };
    getArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuttingReports, startAt, endAt]);

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
      (ranking: { productId: string }) =>
        `${getProductNumber(ranking.productId)} ${getColorName(
          ranking.productId
        )}`
    );

  const data = {
    labels: labels,
    datasets: [
      {
        label: "使用金額（円）",
        data: chartDataList
          ?.slice(0, rankingNumber)
          ?.map((price: { price: number }) => price.price.toFixed()),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <Box p={3} w="100%" h="100%" rounded="md">
      <Bar options={options} data={data} />
    </Box>
  );
};

export default CuttingPriceRanking;
