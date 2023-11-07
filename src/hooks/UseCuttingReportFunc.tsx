import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { useLoadingStore, useAuthStore } from "../../store";
import { CuttingProductType, CuttingReportType } from "../../types";
import { useGetDisp } from "./UseGetDisp";
import { useSWRCuttingReportImutable } from "./swr/useSWRCuttingReportsImutable";
import { useAuthManagement } from "./UseAuthManagement";

export const useCuttingReportFunc = (startDay?: string, endDay?: string) => {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const { getUserName, getProductNumber } = useGetDisp();
  const { isAuths } = useAuthManagement();
  const [csvData, setCsvData] = useState([]);
  const { data, mutate } = useSWRCuttingReportImutable(startDay, endDay);

  // 用尺計算
  const calcScale = (meter: number, totalQuantity: number) => {
    if (meter === 0 || totalQuantity === 0) return 0;
    const value = meter / totalQuantity;
    return value ? value.toFixed(2) : 0;
  };

  // 裁断報告書作成
  const addCuttingReport = async (data, items) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setIsLoading(true);

    const serialNumberDocRef = doc(db, "serialNumbers", "cuttingReportNumbers");
    const cuttingReportDocRef = doc(collection(db, "cuttingReports"));

    try {
      await runTransaction(db, async (transaction) => {
        const serialNumberDocSnap = await transaction.get(serialNumberDocRef);
        if (!serialNumberDocSnap.exists())
          throw "serialNumberDocSnap does not exist!";

        items.map(async (product) => {
          if (!product.productId) return;
          const productDocRef = doc(db, "products", product.productId);
          runTransaction(db, async (transaction) => {
            const productSnap = await transaction.get(productDocRef);
            if (!productSnap.exists()) throw "productSnap does not exist!";
            const tokushimaStock =
              (await productSnap.data()?.tokushimaStock) || 0;
            transaction.update(productDocRef, {
              tokushimaStock: tokushimaStock - Number(product.quantity),
            });
          });
        });

        const newSerialNumber = serialNumberDocSnap.data().serialNumber + 1;
        transaction.update(serialNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        const products = items.map((product) => ({
          ...product,
          quantity: Number(product.quantity),
        }));
        const newItems = { ...data, products };

        const result = transaction.set(cuttingReportDocRef, {
          ...newItems,
          totalQuantity: Number(data.totalQuantity),
          serialNumber: newSerialNumber,
          createUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
      await router.push("/tokushima/cutting-reports");
    }
  };

  // 裁断報告書更新
  const updateCuttingReport = async (
    data: CuttingReportType,
    items: CuttingProductType[],
    reportId: string
  ) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;
    setIsLoading(true);
    const cuttingReportDocRef = doc(db, "cuttingReports", reportId);
    const productsRef = collection(db, "products");

    try {
      runTransaction(db, async (transaction) => {
        const cuttingReportDoc = await transaction.get(cuttingReportDocRef);

        items?.map(async (product, index) => {
          if (!product.productId) return;
          const productDocRef = doc(productsRef, product.productId);
          runTransaction(db, async (transaction) => {
            const productSnap = await transaction.get(productDocRef);
            if (!productSnap.exists()) throw "productSnap does not exist!";

            const tokushimaStock =
              (await productSnap.data()?.tokushimaStock) || 0;

            const initValue =
              (await cuttingReportDoc.data()?.products[index]?.quantity) || 0;

            const newTokushimaStock =
              Number(tokushimaStock) +
              Number(initValue) -
              Number(product.quantity);
            transaction.update(productDocRef, {
              tokushimaStock: Math.round(newTokushimaStock * 100) / 100,
            });
            if (items.length - 1 === index) {
              await mutate({ ...data });
            }
          });
        });
        const products = items.map((product) => ({
          ...product,
          quantity: Number(product.quantity),
        }));
        transaction.update(cuttingReportDocRef, {
          ...data,
          products,
          createdAt: cuttingReportDoc.data()?.createdAt.toDate(),
          updatedAt: serverTimestamp(),
          totalQuantity: Number(data.totalQuantity),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCuttingReport = async (reportId: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    try {
      const docRef = doc(db, "cuttingReports", reportId);
      await deleteDoc(docRef);
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const AlreadyRead = async (report: CuttingReportType) => {
    if (report.staff === currentUser) {
      const docRef = doc(db, "cuttingReports", report.id);
      await updateDoc(docRef, {
        read: arrayUnion(currentUser),
      });
    }
    if (report.staff === "R&D" && isAuths(["rd"])) {
      const docRef = doc(db, "cuttingReports", report.id);
      await updateDoc(docRef, {
        read: arrayUnion( "R&D"),
      });
    }
  };

  const scaleCalc = (meter: number, totalQuantity: number) => {
    if (meter === 0 || totalQuantity === 0) return 0;
    const value = meter / totalQuantity;
    return value ? value.toFixed(2) : 0;
  };

  //CSV作成
  useEffect(() => {
    const headers = [
      "伝票ナンバー",
      "裁断日",
      "担当者名",
      "加工指示書No.",
      "種別",
      "品名",
      "受注先名",
      "数量",
      "カテゴリー",
      "生地品番",
      "数量",
      "用尺",
    ];
    let body = [];
    body.push(headers);
    data?.contents?.forEach((report: CuttingReportType) => {
      report.products.forEach((product) => {
        body.push([
          report.serialNumber,
          report.cuttingDate,
          getUserName(report.staff),
          String(report.processNumber && "No." + report.processNumber),
          Number(report.itemType) === 1 ? "既製品" : "別注品",
          report.itemName,
          report.client,
          report.totalQuantity,
          product.category,
          getProductNumber(product.productId),
          product.quantity,
          scaleCalc(product.quantity, report.totalQuantity),
        ]);
      });
    });
    setCsvData(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return {
    calcScale,
    addCuttingReport,
    updateCuttingReport,
    deleteCuttingReport,
    AlreadyRead,
    scaleCalc,
    csvData,
  };
};
