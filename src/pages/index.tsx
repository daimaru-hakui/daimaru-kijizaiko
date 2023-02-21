import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  colorsState,
  currentUserState,
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
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { ProductType } from "../../types/FabricType";

export default function Home() {
  const [user] = useAuthState(auth);
  const [users, setUsers] = useRecoilState(usersState);
  const [products, setProducts] = useRecoilState(productsState);
  const [grayFabrics, setGrayFabrics] = useRecoilState(grayFabricsState);
  const [suppliers, setSuppliers] = useRecoilState(suppliersState);
  const [stockPlaces, setStockPlaces] = useRecoilState(stockPlacesState);
  const [materialNames, setMaterialNames] = useRecoilState(materialNamesState);
  const [colors, setColors] = useRecoilState(colorsState);
  const currentUser = useRecoilValue(currentUserState);
  const [grayFabricOrders, setGrayFabricOrders] = useState<any>();
  const [fabricDyeingOrders, setFabricDyeingOrders] = useState<any>();
  const [fabricPurchaseOrders, setFabricPurchaseOrders] = useState<any>();

  console.log("start");

  // users情報;
  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("rank", "asc"));
    onSnapshot(q, (querySnapshot) =>
      setUsers(
        querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      )
    );
  }, [setUsers]);
  // // users情報;
  // useEffect(() => {
  //   const usersRef = collection(db, "users");
  //   const q = query(usersRef, orderBy("rank", "asc"));
  //   getDocs(q).then((querySnapshot) => {
  //     setUsers(
  //       querySnapshot.docs.map((doc) => ({
  //         ...doc.data(),
  //         id: doc.id,
  //       }))
  //     );
  //   });
  // }, [setUsers]);

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
              .map((doc) => ({ ...doc.data(), id: doc.id }))
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
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
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
              .map((doc) => ({ ...doc.data(), id: doc?.id }))
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
              .map((doc) => ({ ...doc.data(), id: doc?.id }))
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
              .map((doc) => ({ ...doc.data(), id: doc?.id }))
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
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
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
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
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

  const totalProductsQuantity = (prop: string) => {
    let total = 0;
    products.forEach((product: ProductType) => {
      total += product[prop];
    });
    return total;
  };
  const totalProductsPrice = (prop: string) => {
    let total = 0;
    products.forEach((product: ProductType) => {
      total += product.price * product[prop];
    });
    return total;
  };

  return (
    <Box w="100%" mt={12}>
      <Head>
        <title>生地在庫</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxW="800px" my={6}>
        <Flex mt={6} gap={6} flexDirection={{ base: "column", sm: "row" }}>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>キバタ仕掛件数</StatLabel>
            <StatNumber fontSize="4xl">
              {grayFabricOrders?.length}
              <Box as="span" fontSize="sm" ml={1}>
                件
              </Box>
            </StatNumber>
          </Stat>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>生地仕掛件数</StatLabel>
            <StatNumber fontSize="4xl">
              {fabricDyeingOrders?.length}
              <Box as="span" fontSize="sm" ml={1}>
                件
              </Box>
            </StatNumber>
          </Stat>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>入荷予定件数</StatLabel>
            <StatNumber fontSize="4xl">
              {fabricPurchaseOrders?.length}
              <Box as="span" fontSize="sm" ml={1}>
                件
              </Box>
            </StatNumber>
          </Stat>
        </Flex>
        <Flex mt={6} gap={6} flexDirection={{ base: "column", sm: "row" }}>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>仕掛数量</StatLabel>
            <StatNumber fontSize="4xl">
              {totalProductsQuantity("wip").toFixed(2)}
              <Box as="span" fontSize="sm" ml={1}>
                m
              </Box>
            </StatNumber>
          </Stat>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>仕掛金額</StatLabel>
            <StatNumber fontSize="4xl">
              {Number(totalProductsPrice("wip").toFixed()).toLocaleString()}
              <Box as="span" fontSize="sm" ml={1}>
                円
              </Box>
            </StatNumber>
          </Stat>
        </Flex>
        <Flex mt={6} gap={6} flexDirection={{ base: "column", sm: "row" }}>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>外部在庫数量</StatLabel>
            <StatNumber fontSize="4xl">
              {totalProductsQuantity("externalStock").toFixed(2)}
              <Box as="span" fontSize="sm" ml={1}>
                m
              </Box>
            </StatNumber>
          </Stat>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>外部在庫金額</StatLabel>
            <StatNumber fontSize="4xl">
              {Number(
                totalProductsPrice("externalStock").toFixed()
              ).toLocaleString()}
              <Box as="span" fontSize="sm" ml={1}>
                円
              </Box>
            </StatNumber>
          </Stat>
        </Flex>
        <Flex mt={6} gap={6} flexDirection={{ base: "column", sm: "row" }}>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>入荷待ち数量</StatLabel>
            <StatNumber fontSize="4xl">
              {totalProductsQuantity("arrivingQuantity").toFixed(2)}
              <Box as="span" fontSize="sm" ml={1}>
                m
              </Box>
            </StatNumber>
          </Stat>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>入荷待ち金額</StatLabel>
            <StatNumber fontSize="4xl">
              {Number(
                totalProductsPrice("arrivingQuantity").toFixed()
              ).toLocaleString()}
              <Box as="span" fontSize="sm" ml={1}>
                円
              </Box>
            </StatNumber>
          </Stat>
        </Flex>
        <Flex mt={6} gap={6} flexDirection={{ base: "column", sm: "row" }}>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>在庫数量</StatLabel>
            <StatNumber fontSize="4xl">
              {totalProductsQuantity("tokushimaStock").toFixed(2)}
              <Box as="span" fontSize="sm" ml={1}>
                m
              </Box>
            </StatNumber>
          </Stat>
          <Stat p={6} bg="white" rounded="md" boxShadow="md">
            <StatLabel>在庫金額</StatLabel>
            <StatNumber fontSize="4xl">
              {Number(
                totalProductsPrice("tokushimaStock").toFixed()
              ).toLocaleString()}
              <Box as="span" fontSize="sm" ml={1}>
                円
              </Box>
            </StatNumber>
          </Stat>
        </Flex>
      </Container>
    </Box>
  );
}
