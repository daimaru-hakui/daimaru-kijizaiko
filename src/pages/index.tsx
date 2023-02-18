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
// import { ProductType } from "../../types/ProductType";

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
            email: user?.email || ""
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

  return (
    <div>
      <Head>
        <title>生地在庫</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </div>
  );
}
