import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../firebase";
import { currentUserState, loadingState } from "../../store";
import { CuttingReportType } from "../../types/CuttingReportType";
import { useGetDisp } from "./UseGetDisp";

export const useCuttingReportFunc = (
  items: CuttingReportType | null,
  setItems: Function | null
) => {
  const router = useRouter();
  const currentUser = useRecoilValue(currentUserState);
  const setLoading = useSetRecoilState(loadingState);
  const [cuttingReports, setCuttingReports] = useState(
    [] as CuttingReportType[]
  );
  const { getUserName, getProductNumber } = useGetDisp();
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    const getCuttingReports = () => {
      const q = query(
        collection(db, "cuttingReports"),
        orderBy("serialNumber", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setCuttingReports(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType)
            )
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getCuttingReports();
  }, []);

  // 商品登録項目を追加
  const addInput = () => {
    setItems({
      ...items,
      products: [
        ...items.products,
        { category: "", productId: "", quantity: 0 },
      ],
    });
  };

  // 用尺計算
  const calcScale = (meter: number, totalQuantity: number) => {
    if (meter === 0 || totalQuantity === 0) return 0;
    const value = meter / totalQuantity;
    return value ? value.toFixed(2) : 0;
  };

  // 裁断報告書作成
  const addCuttingReport = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const serialNumberDocRef = doc(db, "serialNumbers", "cuttingReportNumbers");
    const cuttingReportDocRef = doc(collection(db, "cuttingReports"));

    try {
      runTransaction(db, async (transaction) => {
        const serialNumberDocSnap = await transaction.get(serialNumberDocRef);
        if (!serialNumberDocSnap.exists())
          throw "serialNumberDocSnap does not exist!";

        items.products.map(async (product) => {
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

        transaction.set(cuttingReportDocRef, {
          ...items,
          serialNumber: newSerialNumber,
          createUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      router.push("/tokushima/cutting-reports");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 裁断報告書更新
  const updateCuttingReport = async (reportId: string) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const cuttingReportDocRef = doc(db, "cuttingReports", reportId);
    const productsRef = collection(db, "products");
    try {
      runTransaction(db, async (transaction) => {
        const cuttingReportDoc = await transaction.get(cuttingReportDocRef);
        items.products?.map(async (product, index) => {
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
          });
        });

        transaction.update(cuttingReportDocRef, {
          ...items,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
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
    cuttingReports.forEach((report: CuttingReportType) => {
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
  }, [cuttingReports]);

  return {
    cuttingReports,
    addInput,
    calcScale,
    addCuttingReport,
    updateCuttingReport,
    scaleCalc,
    csvData,
  };
};
