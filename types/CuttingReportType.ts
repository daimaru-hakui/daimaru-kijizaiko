export type CuttingReportType = {
  id: string;
  staff: string;
  processNumber: string;
  cuttingDate: string;
  itemName: string;
  itemType: string;
  client: string;
  totalQuantity: number;
  comment: string;
  products: { category: string; productId: string; quantity: number }[];
  serialNumber: number;
};
