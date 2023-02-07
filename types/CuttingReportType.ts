export type CuttingReportType = {
  staff: string;
  processNumber: number;
  cuttingDay: string;
  itemName: string;
  itemType: string;
  client: string;
  totalQuantity: number;
  comment: string;
  products: { category: string; productId: string; quantity: number }[];
  serialNumber: number;
};
