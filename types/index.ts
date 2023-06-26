export type User = {
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

export type Product = {
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
  interfacing: boolean;
  lining: boolean;
  cuttingSchedules:string[],
  wip: number;
  externalStock: number;
  arrivingQuantity: number;
  tokushimaStock: number;
  locations: string[];
  createUser: string;
  updateUser: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GrayFabric = {
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

export type GrayFabricHistory = {
  id: string;
  serialNumber: number;
  orderType: string;
  grayFabricId: string;
  supplierId: string;
  supplierName: string;
  productNumber: string;
  productName: string;
  price: number;
  quantity: number;
  comment: string;
  orderedAt: string;
  scheduledAt: string;
  fixedAt: string;
  createUser: string;
  updateUser: string;
  createdAt: Date;
  updatedAt: Date;
};

export type History = {
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

  export type EditedHistory = {
    scheduledAt: string;
    stockPlaceType:number;
    quantity: number;
    price: number;
    comment: string;
    fixedAt: string;
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
  read:string[]
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

export type Materials = {
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

export type Supplier = {
  id: string;
  name: string;
  kana: string;
  comment: string;
};

export type StockPlace = {
  id: string;
  name: string;
  kana: string;
  address: string;
  tel: string;
  fax: string;
  comment: string;
};

export type Location = {
  id: string;
  name: string;
  order: number;
  comment: string;
};

export type CuttingSchedule = {
  id:string;
  staff:string,
  userRef: string,
  processNumber: string,
  productId: string,
  productRef: string,
  itemName:string,
  quantity: number,
  scheduledAt: string,
}
