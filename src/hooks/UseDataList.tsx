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
import { db } from "../../firebase";
import {
  useAuthStore,
  useCuttingScheduleStore,
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
  CuttingSchedule,
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
  const setGrayFabricOrders = useGrayFabricStore(
    (state) => state.setGrayFabricOrders
  );
  const setFabricDyeingOrders = useProductsStore(
    (state) => state.setFabricDyeingOrders
  );
  const setFabricPurchaseOrders = useProductsStore(
    (state) => state.setFabricPurchaseOrders
  );
  const setCuttingSchedules = useCuttingScheduleStore(
    (state) => state.setCuttingSchedules
  );

  // users情報;
  const getUsers = () => {
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
  };

  // 未登録であればauthorityに登録;
  const registerUser = async () => {
    if (!currentUser) return;
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
  };

  // products情報;
  const getProducts = async () => {
    const q = query(collection(db, "products"), where("deletedAt", "==", ""));
    try {
      onSnapshot(q, (querySnap) =>
        setProducts(
          querySnap.docs
            .map((doc) => ({ ...doc.data(), id: doc.id } as Product))
            .sort((a, b) => a.productNumber < b.productNumber && -1)
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  // キバタ情報;
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

  // キバタ発注履歴（order）
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

  // 生地染色発注履歴（order）
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
            .sort((a, b) => b?.serialNumber - a?.serialNumber)
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  // 生地k購入履歴（order）
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
            .sort((a, b) => b?.serialNumber - a?.serialNumber)
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  // 仕入先　情報;
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

  // 送り先　情報;
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

  
  const getCuttingSchedules = async () => {
    const q = query(
      collection(db, "cuttingSchedules"),
      orderBy("scheduledAt", "desc")
    );
    try {
      onSnapshot(q, (querySnap) =>
        setCuttingSchedules(
          querySnap.docs.map(
            (doc) => ({ ...doc.data(), id: doc.id } as CuttingSchedule)
          )
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  // 徳島工場保管場所;
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

  const getColors = async () => {
    onSnapshot(doc(db, "components", "colors"), (querySnap) =>
      setColors([...querySnap?.data()?.data])
    );
  };

  const getMaterialNames = async () => {
    onSnapshot(doc(db, "components", "materialNames"), (querySnap) =>
      setMaterialNames([...querySnap?.data()?.data])
    );
  };

  return {
    getUsers,
    registerUser,
    getProducts,
    getFabricPurchaseOrders,
    getGrayfabrics,
    getGrayFabricOrders,
    getFabricDyeingOrders,
    getSuppliers,
    getStockPlaces,
    getLocations,
    getColors,
    getMaterialNames,
    getCuttingSchedules,
  };
};
