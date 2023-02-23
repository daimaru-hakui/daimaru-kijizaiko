import { useState } from "react";
import { useRecoilValue } from "recoil";
import { cuttingReportsState } from "../../store";
import { CuttingHistoryType } from "../../types/CuttingHistoryType"
import { CuttingProductType } from "../../types/CuttingProductType"
import { CuttingReportType } from "../../types/CuttingReportType"
import { useGetDisp } from "./UseGetDisp";
import { useUtil } from "./UseUtil";

export const useChart = () => {

  const cuttingReports = useRecoilValue(cuttingReportsState);
  const { getTodayDate } = useUtil()
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE
  const [startAt, setStartAt] = useState(INIT_DATE)
  const [endAt, setEndAt] = useState(getTodayDate)
  const { getPrice } = useGetDisp()

  const getCuttingRankingList = () => {
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
    return result;
  }
  return { getCuttingRankingList }
}