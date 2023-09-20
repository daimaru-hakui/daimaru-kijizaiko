import React from 'react'
import { EditedHistory, History } from '../../types';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthStore, useLoadingStore } from '../../store';
import { useUtil } from './UseUtil';
import { useRouter } from 'next/router';

export const useFabricPurchase = () => {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const { getTodayDate, mathRound2nd } = useUtil();
  const STOCK_PLACE = "徳島工場";

  const updateFabricPurchaseConfirm = async (history: History, items: EditedHistory,data,mutate) => {
    setIsLoading(true);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricPurchaseConfirms", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockPlace === STOCK_PLACE) {
          const stock = (await productDocSnap.data().tokushimaStock) || 0;
          const newStock = stock - history.quantity + Number(items.quantity);
          transaction.update(productDocRef, {
            tokushimaStock: newStock,
          });
        }

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
          price: items.price,
          fixedAt: items.fixedAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      mutate({ ...data });
      setIsLoading(false);
    }
  };

  // 購入状況　orderを削除（stock ranning共通）
  const deleteFabricPurchaseOrder = async (history: History) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricPurchaseOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockType === "stock") {
          const externalStock =
            (await productDocSnap.data().externalStock) || 0;
          const newExternalStock = externalStock + history.quantity;
          const arrivingQuantity =
            (await productDocSnap.data().arrivingQuantity) || 0;
          const newArrivingQuantity = arrivingQuantity - history.quantity;
          transaction.update(productDocRef, {
            externalStock: newExternalStock,
            arrivingQuantity: newArrivingQuantity,
          });
        }
        if (history.stockType === "ranning") {
          const arrivingQuantity =
            (await productDocSnap.data().arrivingQuantity) || 0;
          const newArrivingQuantity = arrivingQuantity - history.quantity;
          transaction.update(productDocRef, {
            arrivingQuantity: newArrivingQuantity,
          });
        }

        transaction.delete(historyDocRef);
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　購入状況　orderを編集（stock ranning共通）
  const updateFabricPurchaseOrder = async (history: History, items: History) => {
    setIsLoading(true);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricPurchaseOrders", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockType === "stock") {
          const externalStock =
            (await productDocSnap.data().externalStock) || 0;
          const newExternalStock =
            externalStock + Number(history.quantity) - Number(items.quantity);

          const arrivingQuantity =
            (await productDocSnap.data().arrivingQuantity) || 0;
          const newArrivingQuantity =
            arrivingQuantity -
            Number(history.quantity) +
            Number(items.quantity);

          transaction.update(productDocRef, {
            externalStock: mathRound2nd(newExternalStock),
            arrivingQuantity: mathRound2nd(newArrivingQuantity),
          });
        }
        if (history.stockType === "ranning") {
          const arrivingQuantity =
            (await productDocSnap.data().arrivingQuantity) || 0;
          const newArrivingQuantity =
            arrivingQuantity - history.quantity + Number(items.quantity);

          transaction.update(productDocRef, {
            arrivingQuantity: mathRound2nd(newArrivingQuantity),
          });
        }

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
          price: Number(items.price),
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
          stockPlace:items.stockPlace,
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 購入状況　確定処理
  const confirmProcessingFabricPurchase = async (history: History, items: History) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const orderHistoryDocRef = doc(db, "fabricPurchaseOrders", history.id);
    const confirmHistoryDocRef = doc(collection(db, "fabricPurchaseConfirms"));

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        const orderHistoryDoc = await transaction.get(orderHistoryDocRef);
        const staff = orderHistoryDoc?.data()?.createUser;

        const newArrivingQuantity =
          (await productDocSnap.data()?.arrivingQuantity) -
          Number(history.quantity) +
          Number(items.remainingOrder) || 0;

        let newTokushimaStock = 0;
        if (items.stockPlace === STOCK_PLACE) {
          newTokushimaStock =
            (await productDocSnap.data()?.tokushimaStock) +
            Number(items.quantity) || 0;
        }

        transaction.update(productDocRef, {
          arrivingQuantity: mathRound2nd(newArrivingQuantity),
          tokushimaStock: mathRound2nd(newTokushimaStock),
        });

        transaction.update(orderHistoryDocRef, {
          quantity: Number(items.remainingOrder),
          orderedAt: items.orderedAt || getTodayDate(),
          scheduledAt: items.scheduledAt || getTodayDate(),
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });

        transaction.set(confirmHistoryDocRef, {
          serialNumber: history.serialNumber,
          orderType: history.orderType,
          grayFabricId: history.grayFabricId,
          productId: history.productId,
          productNumber: history.productNumber,
          productName: history.productName,
          colorName: history.colorName,
          supplierId: history.supplierId,
          supplierName: history.supplierName,
          price: history.price,
          quantity: Number(items.quantity),
          stockPlace: items.stockPlace,
          comment: items.comment,
          orderedAt: items.orderedAt || history.orderedAt,
          fixedAt: items.fixedAt || getTodayDate(),
          createUser: staff,
          updateUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      router.push("/products/fabric-purchase/confirms");
    }
  };

  return {
    updateFabricPurchaseConfirm,
    deleteFabricPurchaseOrder,
    updateFabricPurchaseOrder,
    confirmProcessingFabricPurchase
  };
}
