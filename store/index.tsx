import { atom } from "recoil";
import { ColorType } from "../types/ColorType";
import { ProductType } from "../types/FabricType";
import { GrayFabricType } from "../types/GrayFabricType";
import { HistoryType } from "../types/HistoryType";
import { MaterialNameType } from "../types/MaterialNameType";
import { StockPlaceType } from "../types/StockPlaceType";
import { SupplierType } from "../types/SupplierType";
import { UserType } from "../types/UserType";

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

export const colorsState = atom<ColorType[]>({
  key: "colorsState",
  default: [],
});

export const materialNamesState = atom<MaterialNameType[]>({
  key: "materialNamesState",
  default: [],
});
