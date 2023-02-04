export type CuttingReportType = {
  staff: string;
  orderNumber: number;
  itemName: string;
  itemType: string;
  client: string;
  totalMeter: number;
  totalQuantity: number;
  productNumber: string;
  products: { select: string; productId: string; quantity: number }[];
};
