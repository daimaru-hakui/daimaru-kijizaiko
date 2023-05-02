import { UserInfo } from "@firebase/auth-types";
import { create } from "zustand";
import {
  User,
  Product,
  GrayFabricType,
  HistoryType,
  StockPlaceType,
  SupplierType,
  LocationType,
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
}));

import { atom } from "recoil";

export const grayFabricsState = atom<GrayFabricType[]>({
  key: "grayFabricsState",
  default: [],
});

export const grayFabricOrdersState = atom<HistoryType[]>({
  key: "grayFabricOrdersState",
  default: [],
});

export const fabricDyeingOrdersState = atom<HistoryType[]>({
  key: "fabricDyeingOrdersState",
  default: [],
});

export const fabricPurchaseOrdersState = atom<HistoryType[]>({
  key: "fabricPurchaseOrdersState",
  default: [],
});

export const fabricPurchaseConfirmsState = atom<HistoryType[]>({
  key: "fabricPurchaseConfirmsState",
  default: [],
});

export const suppliersState = atom<SupplierType[]>({
  key: "suppliersState",
  default: [],
});

export const stockPlacesState = atom<StockPlaceType[]>({
  key: "stockPlacesState",
  default: [],
});

export const locationsState = atom<LocationType[]>({
  key: "locationsState",
  default: [],
});

export const colorsState = atom<string[] | null>({
  key: "colorsState",
  default: [],
});

export const materialNamesState = atom<string[] | null>({
  key: "materialNamesState",
  default: [],
});
