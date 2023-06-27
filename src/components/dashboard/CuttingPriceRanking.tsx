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
import { Product, CuttingReportType } from "../../../types";
import { useGetDisp } from "../../hooks/UseGetDisp";
import useSWRImmutable from "swr/immutable";

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

type Data = {
  contents: Product[];
};

export const CuttingPriceRanking: FC<Props> = ({
  data,
  startDay,
  endDay,
  rankingNumber,
}) => {
  const { getProductNumber, getColorName } = useGetDisp();
  const [chartDataList, setChartDataList] = useState([
    { productId: "", quantity: 0, price: 0 },
  ]);
  const { data: products } = useSWRImmutable<Data>("/api/products");

  useEffect(() => {
    const getPrice = (productId: string) => {
      const product = products?.contents.find(
        (product) => product.id === productId
      );
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

      const result: any = newArray.sort((a, b) => {
        if (a.price > b.price) {
          return -1;
        }
      });
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
          ?.map((ranking) => ranking.price.toFixed()),
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