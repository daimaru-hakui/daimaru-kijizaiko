import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { useAuthStore, useLoadingStore, useProductsStore } from "../../../store";
import { Product } from "../../../types";
import { useGetDisp } from "../UseGetDisp";
import { useUtil } from "../UseUtil";

export const useProducts = () => {
  const router = useRouter();
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const currentUser = useAuthStore((state) => state.currentUser);
  const products = useProductsStore((state) => state.products);
  const { getUserName, getSupplierName, getMixed, getFabricStd } = useGetDisp();
  const { getTodayDate } = useUtil();
  const [isVisible, setIsVisible] = useState(false);
  const [csvData, setCsvData] = useState([]);

  const obj = (data: Product, materials) => ({
    productType: data?.productType || "1",
    staff: Number(data?.productType) === 2 ? data?.staff : "R&D",
    supplierId: data?.supplierId || "",
    supplierName: getSupplierName(data?.supplierId) || "",
    grayFabricId: data?.grayFabricId || "",
    interfacing: data?.interfacing || false,
    lining: data?.lining || false,
    productNumber:
      data?.productNum + (data?.colorNum ? "-" + data?.colorNum : "") || "",
    productNum: data?.productNum || "",
    productName: data?.productName || "",
    colorNum: data?.colorNum || "",
    colorName: data?.colorName || "",
    price: Number(data?.price) || 0,
    materialName: data?.materialName || "",
    materials: materials || {},
    fabricWidth: data?.fabricWidth || "",
    fabricWeight: data?.fabricWeight || "",
    fabricLength: data?.fabricLength || "",
    features: data?.features || [],
    noteProduct: data?.noteProduct || "",
    noteFabric: data?.noteFabric || "",
    noteEtc: data?.noteEtc || "",
    wip: 0,
    externalStock: Number(data.externalStock) || 0,
    arrivingQuantity: 0,
    tokushimaStock: Number(data?.tokushimaStock) || 0,
    locations: data.locations || [],
    deletedAt: "",
  });

  // 生地登録
  const addProduct = async (data: Product, materials) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setIsLoading(true);
    const docRef = collection(db, "products");
    const object = obj(data, materials);
    try {
      await addDoc(docRef, {
        ...object,
        createUser: currentUser,
        updateUser: currentUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
      router.push("/products");
    }
  };

  const updateProduct = async (productId: string, data: Product, materials) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;
    setIsLoading(true);
    const docRef = doc(db, "products", `${productId}`);
    const object = obj(data, materials);
    try {
      await updateDoc(docRef, {
        ...object,
        wip: Number(data?.wip) || 0,
        externalStock: Number(data.externalStock) || 0,
        arrivingQuantity: Number(data?.arrivingQuantity) || 0,
        tokushimaStock: Number(data?.tokushimaStock) || 0,
        updateUser: currentUser,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(productId);
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 論理削除
  const deleteProduct = async (id: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    try {
      const docRef = doc(db, "products", id);

      await updateDoc(docRef, {
        deletedAt: getTodayDate(),
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //CSV作成
  useEffect(() => {
    const headers = [
      "担当",
      "品番",
      "色番",
      "色",
      "品名",
      "単価",
      "生地仕掛",
      "外部在庫",
      "入荷待ち",
      "徳島在庫",
      "組織名",
      "混率",
      "規格",
      "機能性",
    ];
    let body = [];
    body.push(headers);
    products.forEach((product) => {
      body.push([
        getUserName(product.staff),
        product.productNum,
        product.colorNum,
        product.colorName,
        product.productName,
        product.price,
        product.wip,
        product.externalStock,
        product.arrivingQuantity,
        product.tokushimaStock,
        product.materialName,
        getMixed(product.materials),
        getFabricStd(
          product.fabricWidth,
          product.fabricLength,
          product.fabricWeight
        ),
        product.features,
      ]);
    });
    setCsvData(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const toggleVisibility = () => {
    window.scrollY > 500 ? setIsVisible(true) : setIsVisible(false);
  };

  const throttle = (fn: Function, interval: number) => {
    let lastTime = Date.now() - interval;
    return function () {
      if (lastTime + interval < Date.now()) {
        lastTime = Date.now();
        fn();
      }
    };
  };

  useEffect(() => {
    window.addEventListener("scroll", throttle(toggleVisibility, 100));
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    csvData,
    isVisible,
  };
};
