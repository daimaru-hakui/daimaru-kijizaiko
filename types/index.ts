export type UserType = {
  id: string;
  uid: string;
  name: string;
  rank: number;
  rd: boolean;
  sales: boolean;
  accounting: boolean;
  tokushima: boolean;
  order: boolean;
};

export type ProductType = {
  id: string;
  productType: number;
  staff: string;
  supplierId: string;
  supplierName: string;
  grayFabricId: string;
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
  features: string[];
  noteProduct: string;
  noteFabric: string;
  noteEtc: string;
  wip: number;
  externalStock: number;
  arrivingQuantity: number;
  tokushimaStock: number;
  createUser: string;
  updateUser: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GrayFabricType = {
  id: string;
  supplierId: string;
  productNumber: string;
  productName: string;
  price: number;
  comment: string;
  wip: number;
  stock: number;
  createUser: string;
};

export type HistoryType = {
  id: string;
  serialNumber: number;
  orderType: string;
  stockType: string;
  grayFabricId: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productNumber: string;
  productName: string;
  colorName: string;
  price: number;
  quantity: number;
  remainingOrder: number;
  comment: string;
  stockPlace: string;
  orderedAt: string;
  scheduledAt: string;
  fixedAt: string;
  createUser: string;
  updateUser: string;
  createdAt: Date;
  updatedAt: Date;
  accounting: boolean;
};

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
  products: {
    category: string;
    productId: string;
    quantity: number;
    productNumber: string;
  }[];
  serialNumber: number;
};

export type CuttingProductType = {
  category: string;
  productId: string;
  quantity: number;
  productNumber: string;
};

export type CuttingHistoryType = {
  id: string;
  staff: string;
  processNumber: string;
  cuttingDate: string;
  itemName: string;
  itemType: string;
  client: string;
  totalQuantity: number;
  comment: string;
  category: string;
  productId: string;
  quantity: number;
  serialNumber: number;
};

export type MaterialsType = {
  t: string;
  c: string;
  n: string;
  r: string;
  h: string;
  pu: string;
  w: string;
  ac: string;
  cu: string;
  si: string;
  as: string;
  z: string;
  f: string;
};

export type SupplierType = {
  id: string;
  name: string;
  kana: string;
  address: string;
  tel: string;
  fax: string;
  comment: string;
};

export type StockPlaceType = {
  id: string;
  name: string;
  kana: string;
  address: string;
  tel: string;
  fax: string;
  comment: string;
};
