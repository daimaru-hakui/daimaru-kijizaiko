export type CuttingReportType = {
  staff: string;
  orderNumber: number;
  totalMeter: number;
  totalQuantity: number;
  productNumber: string;
  contents: { productId: string; quantity: number }[];
};
