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
import Head from "next/head";
import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  colorsState,
  currentUserState,
  fabricDyeingOrdersState,
  fabricPurchaseOrdersState,
  grayFabricOrdersState,
  grayFabricsState,
  materialNamesState,
  productsState,
  stockPlacesState,
  suppliersState,
  usersState,
} from "../../store";
import {
  Box,
  Container,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { ProductType } from "../../types/FabricType";
import { useRouter } from "next/router";
import { SupplierType } from "../../types/SupplierType";
import { HistoryType } from "../../types/HistoryType";
import { GrayFabricType } from "../../types/GrayFabricType";
import { UserType } from "../../types/UserType";
import { StockPlaceType } from "../../types/StockPlaceType";

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const currentUser = useRecoilValue(currentUserState);
  const setUsers = useSetRecoilState(usersState);
  const [products, setProducts] = useRecoilState(productsState);
  const [grayFabrics, setGrayFabrics] = useRecoilState(grayFabricsState);
  const setSuppliers = useSetRecoilState(suppliersState);
  const setStockPlaces = useSetRecoilState(stockPlacesState);
  const setMaterialNames = useSetRecoilState(materialNamesState);
  const setColors = useSetRecoilState(colorsState);
  const [grayFabricOrders, setGrayFabricOrders] = useRecoilState(
    grayFabricOrdersState
  );
  const [fabricDyeingOrders, setFabricDyeingOrders] = useRecoilState(
    fabricDyeingOrdersState
  );
  const [fabricPurchaseOrders, setFabricPurchaseOrders] = useRecoilState(
    fabricPurchaseOrdersState
  );

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

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
      const q = query(
        collection(db, "products"),
        // where("deletedAt", "==", "")
        orderBy("productNumber", "asc")
      );
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
    return a.productNumber - b.productNumber;
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
        collection(db, "historyGrayFabricOrders"),
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
  }, []);

  // 生地発注履歴;
  useEffect(() => {
    const getFabricDyeingOrders = async () => {
      const q = query(
        collection(db, "historyFabricDyeingOrders"),
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
  }, []);

  // 生地発注履歴;
  useEffect(() => {
    const getFabricPurchaseOrders = async () => {
      const q = query(
        collection(db, "historyFabricPurchaseOrders"),
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
  }, []);

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
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
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
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getMaterialNames();
  }, [setMaterialNames]);

  return (
    <Box w="100%" mt={12}>
      <Head>
        <title>生地在庫</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </Box>
  );
}
