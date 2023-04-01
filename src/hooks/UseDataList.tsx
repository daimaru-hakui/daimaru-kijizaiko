/* eslint-disable react-hooks/exhaustive-deps */
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
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
  locationsState,
  materialNamesState,
  productsState,
  stockPlacesState,
  suppliersState,
  usersState,
} from "../../store";
import {
  UserType,
  ProductType,
  GrayFabricType,
  SupplierType,
  HistoryType,
  StockPlaceType,
  LocationType,
} from "../../types";

export const useDataList = () => {
  const [user] = useAuthState(auth);
  const currentUser = useRecoilValue(currentUserState);
  const setUsers = useSetRecoilState(usersState);
  const setProducts = useSetRecoilState(productsState);
  const setGrayFabrics = useSetRecoilState(grayFabricsState);
  const setSuppliers = useSetRecoilState(suppliersState);
  const setStockPlaces = useSetRecoilState(stockPlacesState);
  const setLocations = useSetRecoilState(locationsState);
  const setMaterialNames = useSetRecoilState(materialNamesState);
  const setColors = useSetRecoilState(colorsState);
  const setGrayFabricOrders = useSetRecoilState(grayFabricOrdersState);
  const setFabricDyeingOrders = useSetRecoilState(fabricDyeingOrdersState);
  const setFabricPurchaseOrders = useSetRecoilState(fabricPurchaseOrdersState);

  // users情報;
  useEffect(() => {
    if (!user) return;
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
    console.log("users");
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
    if (!user) return;
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
    console.log("products");
    getProducts();
  }, [setProducts]);

  function compareFunc(a: any, b: any) {
    if (a.productNumber < b.productNumber) {
      return -1;
    }
  }

  // キバタ情報;
  useEffect(() => {
    if (!user) return;
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

  // キバタ発注履歴（order）
  useEffect(() => {
    if (!user) return;
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

  // 生地染色発注履歴（order）
  useEffect(() => {
    if (!user) return;
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

  // 生地k購入履歴（order）
  useEffect(() => {
    if (!user) return;
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

  // 仕入先　情報;
  useEffect(() => {
    if (!user) return;
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
    if (!user) return;
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

  // 徳島工場保管場所;
  useEffect(() => {
    if (!user) return;
    const getLocations = async () => {
      const q = query(collection(db, "locations"), orderBy("order", "asc"));
      try {
        onSnapshot(q, (querySnap) =>
          setLocations(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as LocationType)
            )
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getLocations();
  }, [setLocations]);

  useEffect(() => {
    if (!user) return;
    const getColors = async () => {
      onSnapshot(doc(db, "components", "colors"), (querySnap) =>
        setColors([...querySnap?.data()?.data])
      );
    };
    getColors();
    console.log("color");
  }, [setColors]);

  useEffect(() => {
    if (!user) return;
    const getMaterialNames = async () => {
      onSnapshot(doc(db, "components", "materialNames"), (querySnap) =>
        setMaterialNames([...querySnap?.data()?.data])
      );
    };

    getMaterialNames();
    console.log("materialNames");
  }, [setMaterialNames]);

  const start = () => {
    return true;
  };

  return { start };
};
