import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useRecoilValue } from 'recoil';
import { cuttingReportsState } from '../../../store';
import { Box } from '@chakra-ui/react';
import { CuttingHistoryType } from '../../../types/CuttingHistoryType';
import { CuttingReportType } from '../../../types/CuttingReportType';
import { CuttingProductType } from '../../../types/CuttingProductType';
import { useUtil } from '../../hooks/UseUtil';
import { useGetDisp } from '../../hooks/UseGetDisp';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CuttingQuantityRanking = () => {
  const cuttingReports = useRecoilValue(cuttingReportsState);
  const { getTodayDate } = useUtil()
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE
  const [startAt, setStartAt] = useState(INIT_DATE)
  const [endAt, setEndAt] = useState(getTodayDate)
  const { getProductNumber, getColorName, getPrice } = useGetDisp()
  const [cuttingQuantities, setCuttingQuantities] = useState(
    [{ productId: "", quantity: 0 }]
  );
  const [cuttingPrices, setCuttingPrices] = useState(
    [{ productId: "", quantity: 0, price: 0 }]
  );

  useEffect(() => {
    const getCuttingReports = async () => {

      const newCuttingReports = cuttingReports
        .map((cuttingReport: CuttingReportType) =>
          cuttingReport.products.map((product: CuttingProductType) => ({
            ...cuttingReport,
            ...product,
            products: null
          } as CuttingHistoryType))
        )
        .flat()
        .filter((report: { cuttingDate: string }) =>
        ((new Date(report.cuttingDate).getTime() >= new Date(startAt).getTime()) &&
          (new Date(report.cuttingDate).getTime() <= new Date(endAt).getTime())))

      const ProductIds = newCuttingReports.map((report) => (report.productId))
      const headersObj = new Set(ProductIds)
      const headers = Array.from(headersObj)

      const productfilterReports = headers.map((header: any) => (
        newCuttingReports.filter((report: any) => (
          header === report.productId
        ))))

      const result = productfilterReports.map((reports: any) => {
        let sum = 0
        let productId = ""
        reports?.forEach((report: { productId: string; quantity: number }) => {
          sum += report.quantity
          productId = report.productId
        })
        return { productId, quantity: sum, price: getPrice(productId) }
      })

      const cuttingQuantity = result.sort((a, b) => {
        if (a.quantity > b.quantity) {
          return -1
        }
      })
      setCuttingQuantities(cuttingQuantity)
      setCuttingPrices(cuttingPrices)
    };
    getCuttingReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuttingReports, startAt, endAt]);
  console.log(cuttingQuantities)

  const options = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: '生地使用数量ランキング',
      },
    },
  };

  const labels = cuttingQuantities?.slice(0, 5)?.map((ranking: { productId: string }) => (
    `${getProductNumber(ranking.productId)} ${getColorName(ranking.productId)}`
  ))

  const data = {
    labels,
    datasets: [
      {
        label: '使用数量（ｍ）',
        data: cuttingQuantities?.slice(0, 5)?.map((ranking: { quantity: number }) => (
          ranking.quantity
        )),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return (
    <Box bg="white" w="100%" h="100%" rounded="md" shadow="md">
      <Bar options={options} data={data} />
    </Box>
  )
}

export default CuttingQuantityRanking