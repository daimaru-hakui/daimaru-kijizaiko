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
import { useChart } from '../../hooks/UseChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CuttingPriceRanking = () => {
  const cuttingReports = useRecoilValue(cuttingReportsState);
  const { getTodayDate } = useUtil()
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE
  const [startAt, setStartAt] = useState(INIT_DATE)
  const [endAt, setEndAt] = useState(getTodayDate)
  const { getProductNumber, getColorName, getPrice } = useGetDisp()
  const [cuttingPrices, setCuttingPrices] = useState<any>();


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
        let sum = 0;
        let productId = "";
        let price = 0;
        reports?.forEach((report: { productId: string; quantity: number }) => {
          sum += report.quantity
          productId = report.productId
          price += report.quantity * getPrice(report.productId)
        })
        return { productId, quantity: sum, price }
      })
      const cuttingPrices = result.sort((a, b) => {
        if ((a.price) > (b.price)) {
          return -1
        }
      })
      setCuttingPrices(cuttingPrices)
    };
    getCuttingReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuttingReports, startAt, endAt]);




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
        text: '生地使用金額ランキング',
      },
    },
  };

  const labels = cuttingPrices?.slice(0, 5)?.map((ranking: { productId: string }) => (
    `${getProductNumber(ranking.productId)} ${getColorName(ranking.productId)}`
  ))

  const data = {
    labels: labels,
    datasets: [
      {
        label: '金額（円）',
        data: cuttingPrices?.slice(0, 5)?.map((price: { price: number }) => (
          price.price.toFixed()
        )),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };


  return (
    <Box bg="white" w="100%" h="100%" rounded="md" shadow="md">
      <Bar options={options} data={data} />
    </Box>
  )
}

export default CuttingPriceRanking