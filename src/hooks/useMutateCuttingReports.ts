import { collection, deleteDoc, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react'
import { db } from '../../firebase';
import { useRouter } from 'next/router';
import { useAuthStore, useLoadingStore } from '../../store';
import { useGetDisp } from './UseGetDisp';
import { CuttingProductType, CuttingReportType } from '../../types';
import { mutate } from 'swr';
import { Mutation, useMutation, useQueryClient } from 'react-query';

export const useMutateCuttingReports = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.currentUser);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const { getUserName, getProductNumber } = useGetDisp();
  const [csvData, setCsvData] = useState([]);

  // 用尺計算
  const calcScale = (meter: number, totalQuantity: number) => {
    if (meter === 0 || totalQuantity === 0) return 0;
    const value = meter / totalQuantity;
    return value ? value.toFixed(2) : 0;
  };

  // 裁断報告書作成
  const addCuttingReport = async (data:CuttingReportType, items:CuttingProductType[]) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setIsLoading(true);

    const serialNumberDocRef = doc(db, "serialNumbers", "cuttingReportNumbers");
    const cuttingReportDocRef = doc(collection(db, "cuttingReports"));

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
        console.log('result',result)
      });
   
  };

  // 裁断報告書更新
  const updateCuttingReport = async ({ data, items, reportId } ) => {
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
      const docSnap = getDoc(cuttingReportDocRef);
      return docSnap;
    }
  };

  const update = useMutation({
    mutationFn: async (obj:any) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;
    const cuttingReportDocRef = doc(db, "cuttingReports", obj.reportId);
    const productsRef = collection(db, "products");
    try {
      runTransaction(db, async (transaction) => {
        const cuttingReportDoc = await transaction.get(cuttingReportDocRef);

        obj.items?.map(async (product, index) => {
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
        const products = obj.items.map((product) => ({
          ...product,
          quantity: Number(product.quantity),
        }));
        transaction.update(cuttingReportDocRef, {
          ...obj.data,
          products,
          createdAt: cuttingReportDoc.data()?.createdAt.toDate(),
          updatedAt: serverTimestamp(),
          totalQuantity: Number(obj.data.totalQuantity),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      const result = {...obj.data, products:[...obj.items]}
      return result
    }
  },
    onSuccess: async(data) => {
      const previousPosts = queryClient.getQueryData<CuttingReportType[]>(['cuttingReports']);
      if (previousPosts) {
        queryClient.setQueryData<CuttingReportType[]>(['cuttingReports'], previousPosts.map((prev) => (
          prev.id === data.id ? data : prev 
        )));
        queryClient.setQueryData<CuttingReportType>(['cuttingReports',data.id], data);
      }
    },
  })

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

  const scaleCalc = (meter: number, totalQuantity: number) => {
    if (meter === 0 || totalQuantity === 0) return 0;
    const value = meter / totalQuantity;
    return value ? value.toFixed(2) : 0;
  };
  return {update}
}
