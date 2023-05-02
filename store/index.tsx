import { UserInfo } from "@firebase/auth-types";
import { create } from "zustand";
import {
  User,
  Product,
  GrayFabric,
  History,
  StockPlace,
  Supplier,
  Location,
  GrayFabricHistory,
} from "../types";

type AuthState = {
  session: UserInfo | null;
  setSession: (payload: UserInfo | null) => void;
  currentUser: string | "";
  setCurrentUser: (payload: string | undefined) => void;
  users: User[];
  setUsers: (payload: User[] | []) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  setSession: (payload) => set({ session: payload }),
  currentUser: "",
  setCurrentUser: (payload) => set({ currentUser: payload }),
  users: [],
  setUsers: (payload) => set({ users: payload }),
}));

// Loading
type LoadingState = {
  isLoading: boolean;
  setIsLoading: (payload: boolean) => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (payload) => set({ isLoading: payload }),
}));

// Products
type ProductsState = {
  products: Product[];
  setProducts: (payload: Product[]) => void;
  fabricDyeingOrders: History[],
  setFabricDyeingOrders: (payload: History[]) => void;
  fabricPurchaseOrders: History[],
  setFabricPurchaseOrders: (payload: History[]) => void;
};

export const useProductsStore = create<ProductsState>((set) => ({
  products: [
    {
      id: "",
      productType: 0,
      staff: "",
      supplierId: "",
      supplierName: "",
      grayFabricId: "",
      productNumber: "",
      productNum: "",
      productName: "",
      colorNum: "",
      colorName: "",
      price: 0,
      materialName: "",
      materials: "",
      fabricWidth: 0,
      fabricWeight: 0,
      fabricLength: 0,
      features: [],
      noteProduct: "",
      noteFabric: "",
      noteEtc: "",
      interfacing: false,
      lining: false,
      wip: 0,
      externalStock: 0,
      arrivingQuantity: 0,
      tokushimaStock: 0,
      locations: [],
      createUser: "",
      updateUser: "",
      createdAt: undefined,
      updatedAt: undefined,
    },
  ],
  setProducts: (payload) => set({ products: payload }),
  fabricDyeingOrders: [],
  setFabricDyeingOrders: (payload) => set({ fabricDyeingOrders: payload }),
  fabricPurchaseOrders: [],
  setFabricPurchaseOrders: (payload) => set({ fabricPurchaseOrders: payload }),
}));

// settings
type SettingState = {
  suppliers: Supplier[];
  setSuppliers: (payload: Supplier[]) => void;
  stockPlaces: StockPlace[];
  setStockPlaces: (payload: StockPlace[]) => void;
  locations: Location[];
  setLocations: (payload: Location[]) => void;
  colors: string[];
  setColors: (payload: string[]) => void;
  materialNames: string[];
  setMaterialNames: (payload: string[]) => void;
};

export const useSettingStore = create<SettingState>((set) => ({
  suppliers: [{ id: "", name: "", kana: "", comment: "" }],
  setSuppliers: (payload) => set({ suppliers: payload }),
  stockPlaces: [
    {
      id: "",
      name: "",
      kana: "",
      address: "",
      tel: "",
      fax: "",
      comment: "",
    },
  ],
  setStockPlaces: (payload) => set({ stockPlaces: payload }),
  locations: [
    {
      id: "",
      name: "",
      order: 0,
      comment: "",
    },
  ],
  setLocations: (payload) => set({ locations: payload }),
  colors: [],
  setColors: (payload) => set({ colors: payload }),
  materialNames: [],
  setMaterialNames: (payload) => set({ materialNames: payload }),
}));

// GrayFabrics
type GrayFabricsState = {
  grayFabrics: GrayFabric[];
  setGrayFabrics: (payload: GrayFabric[]) => void;
  grayFabricOrders: GrayFabricHistory[];
  setGrayFabricOrders: (payload: GrayFabricHistory[]) => void;
};

export const useGrayFabricStore = create<GrayFabricsState>((set) => ({
  grayFabrics: [{
    id: "",
    supplierId: "",
    productNumber: "",
    productName: "",
    price: 0,
    comment: "",
    wip: 0,
    stock: 0,
    createUser: ""
  }],
  setGrayFabrics: (payload) => set({ grayFabrics: payload }),
  grayFabricOrders: [{
    id: "",
    serialNumber: 0,
    orderType: "",
    grayFabricId: "",
    supplierId: "",
    supplierName: "",
    productNumber: "",
    productName: "",
    price: 0,
    quantity: 0,
    comment: "",
    orderedAt: "",
    scheduledAt: "",
    fixedAt: "",
    createUser: "",
    updateUser: "",
    createdAt: null,
    updatedAt: null
  }],
  setGrayFabricOrders: (payload) => set({ grayFabricOrders: payload }),
}));
