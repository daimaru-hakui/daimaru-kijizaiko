import {
  collection,
  doc,
  startAt,
  endAt,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  colorsState,
  currentUserState,
  fabricDyeingOrdersState,
  fabricPurchaseConfirmsState,
  fabricPurchaseOrdersState,
  grayFabricOrdersState,
  grayFabricsState,
  materialNamesState,
  productsState,
  stockPlacesState,
  suppliersState,
  usersState,
} from "../../store";
import { ProductType } from "../../types/FabricType";
import { useRouter } from "next/router";
import { SupplierType } from "../../types/SupplierType";
import { HistoryType } from "../../types/HistoryType";
import { GrayFabricType } from "../../types/GrayFabricType";
import { UserType } from "../../types/UserType";
import { StockPlaceType } from "../../types/StockPlaceType";
import { ColorType } from "../../types/ColorType";
import { MaterialNameType } from "../../types/MaterialNameType";

export const useDataList = () => {
  const [user] = useAuthState(auth);
  const currentUser = useRecoilValue(currentUserState);
  const setUsers = useSetRecoilState(usersState);
  const [products, setProducts] = useRecoilState(productsState);
  const [grayFabrics, setGrayFabrics] = useRecoilState(grayFabricsState);
  const setSuppliers = useSetRecoilState(suppliersState);
  const setStockPlaces = useSetRecoilState(stockPlacesState);
  const setMaterialNames = useSetRecoilState(materialNamesState);
  const setColors = useSetRecoilState(colorsState);
  const setGrayFabricOrders = useSetRecoilState(grayFabricOrdersState);
  const setFabricDyeingOrders = useSetRecoilState(fabricDyeingOrdersState);
  const setFabricPurchaseOrders = useSetRecoilState(fabricPurchaseOrdersState);
  const setFabricPurchaseConfirms = useSetRecoilState(
    fabricPurchaseConfirmsState
  );
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;

  // users情報;
  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("rank", "asc"));
    onSnapshot(q, (querySnapshot) =>
      setUsers(
        querySnapshot.docs.map(
          (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as UserType)
        )
      )
    );
  }, [setUsers]);

  // 未登録であればauthorityに登録;
  useEffect(() => {
    if (currentUser) {
      const docRef = doc(db, "users", `${currentUser}`);
      const addUsers = async () => {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            uid: currentUser,
            name: user?.email || "",
            rank: 1000,
            email: user?.email || "",
          });
        }
      };
      addUsers();
    }
  }, [currentUser, user]);

  // products情報;
  useEffect(() => {
    const getProducts = async () => {
      const q = query(collection(db, "products"), where("deletedAt", "==", ""));
      try {
        onSnapshot(q, (querySnap) =>
          setProducts(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc.id } as ProductType))
              .sort(compareFunc)
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getProducts();
  }, [setProducts]);

  function compareFunc(a: any, b: any) {
    if (a.productNumber < b.productNumber) {
      return -1;
    }
  }

  // キバタ情報;
  useEffect(() => {
    const getGrayfabrics = async () => {
      const q = query(
        collection(db, "grayFabrics"),
        orderBy("productNumber", "asc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setGrayFabrics(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as GrayFabricType)
            )
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getGrayfabrics();
  }, [setGrayFabrics]);

  // キバタ発注履歴;
  useEffect(() => {
    const getGrayFabricOrders = async () => {
      const q = query(
        collection(db, "grayFabricOrders"),
        where("quantity", ">", 0)
      );
      try {
        onSnapshot(q, (querySnap) =>
          setGrayFabricOrders(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc?.id } as HistoryType))
              .sort((a: any, b: any) => b?.serialNumber - a?.serialNumber)
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getGrayFabricOrders();
  }, [setGrayFabricOrders]);

  // 生地発注履歴;
  useEffect(() => {
    const getFabricDyeingOrders = async () => {
      const q = query(
        collection(db, "fabricDyeingOrders"),
        where("quantity", ">", 0)
      );
      try {
        onSnapshot(q, (querySnap) =>
          setFabricDyeingOrders(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc?.id } as HistoryType))
              .sort((a: any, b: any) => b?.serialNumber - a?.serialNumber)
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getFabricDyeingOrders();
  }, [setFabricDyeingOrders]);

  // 生地発注履歴（order）
  useEffect(() => {
    const getFabricPurchaseOrders = async () => {
      const q = query(
        collection(db, "fabricPurchaseOrders"),
        where("quantity", ">", 0)
      );
      try {
        onSnapshot(q, (querySnap) =>
          setFabricPurchaseOrders(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc?.id } as HistoryType))
              .sort((a: any, b: any) => b?.serialNumber - a?.serialNumber)
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getFabricPurchaseOrders();
  }, [setFabricPurchaseOrders]);

  // 生地発注履歴（confirm）
  // useEffect(() => {
  //   const getFabricPurchaseConfirms = async () => {
  //     const q = query(
  //       collection(db, "fabricPurchaseConfirms"),
  //       where("quantity", ">", 0)
  //     );
  //     try {
  //       onSnapshot(q, (querySnap) =>
  //         setFabricPurchaseConfirms(
  //           querySnap.docs
  //             .map((doc) => ({ ...doc.data(), id: doc?.id } as HistoryType))
  //             .sort((a: any, b: any) => b?.serialNumber - a?.serialNumber)
  //         )
  //       );
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   getFabricPurchaseConfirms();
  // }, [setFabricPurchaseConfirms]);

  // 仕入先　情報;
  useEffect(() => {
    const getSuppliers = async () => {
      const q = query(collection(db, "suppliers"), orderBy("kana", "asc"));
      try {
        onSnapshot(q, (querySnap) =>
          setSuppliers(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as SupplierType)
            )
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getSuppliers();
  }, [setSuppliers]);

  // 送り先　情報;
  useEffect(() => {
    const getStockPlaces = async () => {
      const q = query(collection(db, "stockPlaces"), orderBy("kana", "asc"));
      try {
        onSnapshot(q, (querySnap) =>
          setStockPlaces(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as StockPlaceType)
            )
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getStockPlaces();
  }, [setStockPlaces]);

  // 色のデータを取得
  useEffect(() => {
    const getColors = async () => {
      const q = query(collection(db, "colors"), orderBy("name", "asc"));
      try {
        onSnapshot(q, (querySnap) =>
          setColors(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as ColorType)
            )
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getColors();
  }, [setColors]);

  // 組織名のデータを取得
  useEffect(() => {
    const getMaterialNames = async () => {
      const q = query(collection(db, "materialNames"), orderBy("name", "asc"));
      try {
        onSnapshot(q, (querySnap) =>
          setMaterialNames(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as MaterialNameType)
            )
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getMaterialNames();
  }, [setMaterialNames]);

  const start = () => {
    return true;
  };

  return { start };
};
