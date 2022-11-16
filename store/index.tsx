import { atom } from "recoil";
export const loadingState = atom<boolean>({
  key: "loadingState",
  default: false,
});

export const currentUserState = atom<any>({
  key: "currentUserState",
  default: "",
});

export const usersState = atom<any>({
  key: "usersState",
  default: [],
});

export const suppliersState = atom<any>({
  key: "suppliersState",
  default: [],
});

export const colorsState = atom<any>({
  key: "colorsState",
  default: [],
});

export const materialNamesState = atom<any>({
  key: "materialNamesState",
  default: [],
});
