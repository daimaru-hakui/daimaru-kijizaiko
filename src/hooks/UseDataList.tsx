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
import { db } from "../../firebase";
import {
  useAuthStore,
  useGrayFabricStore,
  useProductsStore,
  useSettingStore,
} from "../../store";
import {
  User,
  GrayFabric,
  Supplier,
  History,
  StockPlace,
  Location,
  Product,
} from "../../types";

export const useDataList = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const session = useAuthStore((state) => state.session);
  const setUsers = useAuthStore((state) => state.setUsers);
  const setProducts = useProductsStore((state) => state.setProducts);
  const setGrayFabrics = useGrayFabricStore((state) => state.setGrayFabrics);
  const setSuppliers = useSettingStore((state) => state.setSuppliers);
  const setStockPlaces = useSettingStore((state) => state.setStockPlaces);
  const setLocations = useSettingStore((state) => state.setLocations);
  const setMaterialNames = useSettingStore((state) => state.setMaterialNames);
  const setColors = useSettingStore((state) => state.setColors);
  const setGrayFabricOrders = useGrayFabricStore((state) => state.setGrayFabricOrders);
  const setFabricDyeingOrders = useProductsStore((state) => state.setFabricDyeingOrders);
  const setFabricPurchaseOrders = useProductsStore((state) => state.setFabricPurchaseOrders);

  // users情報;
  useEffect(() => {
    if (!currentUser) return;
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("rank", "asc"));
    onSnapshot(q, (querySnapshot) =>
      setUsers(
        querySnapshot.docs.map(
          (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as User)
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
            name: session?.email || "",
            rank: 1000,
            email: session?.email || "",
          });
        }
      };
      addUsers();
    }
  }, [currentUser, session]);

  // products情報;
  useEffect(() => {
    if (!currentUser) return;
    const getProducts = async () => {
      const q = query(collection(db, "products"), where("deletedAt", "==", ""));
      try {
        onSnapshot(q, (querySnap) =>
          setProducts(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc.id } as Product))
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
    if (!currentUser) return;
    const getGrayfabrics = async () => {
      const q = query(
        collection(db, "grayFabrics"),
        orderBy("productNumber", "asc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setGrayFabrics(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as GrayFabric)
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
    if (!currentUser) return;
    const getGrayFabricOrders = async () => {
      const q = query(
        collection(db, "grayFabricOrders"),
        where("quantity", ">", 0)
      );
      try {
        onSnapshot(q, (querySnap) =>
          setGrayFabricOrders(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc?.id } as History))
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
    if (!currentUser) return;
    const getFabricDyeingOrders = async () => {
      const q = query(
        collection(db, "fabricDyeingOrders"),
        where("quantity", ">", 0)
      );
      try {
        onSnapshot(q, (querySnap) =>
          setFabricDyeingOrders(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc?.id } as History))
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
    if (!currentUser) return;
    const getFabricPurchaseOrders = async () => {
      const q = query(
        collection(db, "fabricPurchaseOrders"),
        where("quantity", ">", 0)
      );
      try {
        onSnapshot(q, (querySnap) =>
          setFabricPurchaseOrders(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc?.id } as History))
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
    if (!currentUser) return;
    const getSuppliers = async () => {
      const q = query(collection(db, "suppliers"), orderBy("kana", "asc"));
      try {
        onSnapshot(q, (querySnap) =>
          setSuppliers(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as Supplier)
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
    if (!currentUser) return;
    const getStockPlaces = async () => {
      const q = query(collection(db, "stockPlaces"), orderBy("kana", "asc"));
      try {
        onSnapshot(q, (querySnap) =>
          setStockPlaces(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as StockPlace)
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
    if (!currentUser) return;
    const getLocations = async () => {
      const q = query(collection(db, "locations"), orderBy("order", "asc"));
      try {
        onSnapshot(q, (querySnap) =>
          setLocations(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as Location)
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
    if (!currentUser) return;
    const getColors = async () => {
      onSnapshot(doc(db, "components", "colors"), (querySnap) =>
        setColors([...querySnap?.data()?.data])
      );
    };
    getColors();
    console.log("color");
  }, [setColors]);

  useEffect(() => {
    if (!currentUser) return;
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
