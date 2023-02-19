import { collection, doc, getDoc, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../firebase";
import { currentUserState, loadingState } from "../../store";
import { CuttingReportType } from "../../types/CuttingReportType";

export const useCuttingReportFunc = (items: CuttingReportType | null, setItems: Function | null) => {
  const router = useRouter();
  const currentUser = useRecoilValue(currentUserState);
  const setLoading = useSetRecoilState(loadingState);

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
        const newSerialNumber = serialNumberDocSnap.data().serialNumber + 1;

        items.products.map(async (product) => {
          if (!product.productId) return;
          const productDocRef = doc(db, "products", product.productId);

          const productSnap = await getDoc(productDocRef);
          if (!productSnap.exists()) throw "productSnap does not exist!";
          const tokushimaStock = productSnap.data()?.tokushimaStock || 0;
          // transaction.update(productDocRef, {
          //   tokushimaStock: tokushimaStock - Number(product.quantity),
          // });
          await updateDoc(productDocRef, {
            tokushimaStock: tokushimaStock - Number(product.quantity),
          });
        });

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
      window.alert("登録失敗");
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
        transaction.update(cuttingReportDocRef, {
          ...items,
        });
        const cuttingReportDoc = await getDoc(cuttingReportDocRef)

        items.products?.map(async (product, index) => {
          if (!product.productId) return;
          const productDocRef = doc(productsRef, product.productId);
          const productSnap = await getDoc(productDocRef);
          if (!productSnap.exists()) throw "productSnap does not exist!";

          const tokushimaStock = await productSnap.data()?.tokushimaStock || 0;

          const initValue = cuttingReportDoc.data()?.products[index]?.quantity || 0;

          const newTokushimaStock =
            Number(tokushimaStock) +
            Number(initValue) -
            Number(product.quantity);
          // transaction.update(productDocRef, {
          //   tokushimaStock: Math.round(newTokushimaStock * 100) / 100,
          // });
          await updateDoc(productDocRef, {
            tokushimaStock: Math.round(newTokushimaStock * 100) / 100,
          });
        });
      });
    } catch (err) {
      console.log(err);
      window.alert("登録失敗");
    } finally {
      setLoading(false);
    }
  };

  return { addInput, calcScale, addCuttingReport, updateCuttingReport }
}