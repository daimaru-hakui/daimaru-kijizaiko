import { atom } from "recoil";
export const loadingState = atom<boolean>({
  key: "loadingState",
  default: false,
});

export const currentUserAuth = atom<any>({
  key: "currentUserState",
  default: "",
});

export const usersAuth = atom<any>({
  key: "usersAuthState",
  default: "",
});
