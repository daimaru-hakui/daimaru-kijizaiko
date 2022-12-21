export type ProductType = {
  id: string;
  productType: number;
  staff: string;
  supplier: string;
  productNumber: string;
  productNum: string;
  productName: string;
  colorNum: string;
  colorName: string;
  price: number;
  materialName: string;
  materials: any;
  fabricWidth: number;
  fabricWeight: number;
  fabricLength: number;
  features: [];
  noteProduct: string;
  noteFabric: string;
  noteEtc: string;
  wip: number;

  wipFabricDyeingQuantity: number;
  stockFabricDyeingQuantity: number;
  shippingQuantity: number;
  stockTokushimaQuantity: number;
  grayFabricsId: string;
};
