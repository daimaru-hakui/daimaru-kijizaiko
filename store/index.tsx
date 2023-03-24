import { atom } from "recoil";
import {
  UserType,
  ProductType,
  GrayFabricType,
  HistoryType,
  StockPlaceType,
  SupplierType,
} from "../types";

export const loadingState = atom<boolean>({
  key: "loadingState",
  default: false,
});

export const currentUserState = atom<any>({
  key: "currentUserState",
  default: "",
});

export const usersState = atom<UserType[]>({
  key: "usersState",
  default: [],
});

export const productsState = atom<ProductType[]>({
  key: "productsState",
  default: [],
});

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

export const colorsState = atom<string[] | null>({
  key: "colorsState",
  default: [],
});

export const materialNamesState = atom<string[] | null>({
  key: "materialNamesState",
  default: [],
});
