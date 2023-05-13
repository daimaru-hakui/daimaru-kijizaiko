import React from 'react'
import { EditedHistory, History } from '../../../types';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuthStore, useLoadingStore } from '../../../store';
import { useRouter } from 'next/router';
import { useUtil } from '../UseUtil';

export const useFabricDyeing = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const router = useRouter();
  const { getTodayDate } = useUtil();

  // confirms
  const updateFabricDyeingConfirm = async (history: History, items: EditedHistory, data,mutate) => {
    setIsLoading(true);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingConfirms", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = (await productDocSnap.data().externalStock) || 0;
        const newStock = stock - history.quantity + Number(items.quantity);
        transaction.update(productDocRef, {
          externalStock: Number(newStock),
        });

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
          price: Number(items.price),
          fixedAt: items.fixedAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
      mutate({ ...data });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // orders
  const deleteFabricDyeingOrderStock = async (history: History) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDoSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDoSnap.exists())
          throw "grayFabricDoSnap document does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        let stock = (await grayFabricDoSnap.data().stock) || 0;
        const newStock = stock + Number(history.quantity);
        transaction.update(grayFabricDocRef, {
          stock: Number(newStock),
        });

        let wip = (await productDocSnap.data().wip) || 0;
        const newWip = wip - Number(history.quantity);
        transaction.update(productDocRef, {
          wip: Number(newWip),
        });

        transaction.delete(historyDocRef);
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  // 生地仕掛状況　Orderを削除  type ranning
  const deleteFabricDyeingOrderRanning = async (history: History) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        let wip = (await productDocSnap.data().wip) || 0;
        const newWip = Number(wip) - Number(history.quantity);
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.delete(historyDocRef);
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　生地仕掛状況　Order　編集（Stock在庫）
  const updateFabricDyeingOrderStock = async (history: History, items: History) => {
    setIsLoading(true);
    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabricDocSnap does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = (await grayFabricDocSnap.data().stock) || 0;
        const newStock =
          Number(stock) + Number(history.quantity) - Number(items.quantity);
        transaction.update(grayFabricDocRef, {
          stock: newStock,
        });

        const wip = (await productDocSnap.data().wip) || 0;
        const newWip =
          Number(wip) - Number(history.quantity) + Number(items.quantity);
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
          price: Number(items.price),
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
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

  //　生地仕掛状況　Order　編集（ranning在庫）
  const updateFabricDyeingOrderRanning = async (history: History, items: History) => {
    setIsLoading(true);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const wip = (await productDocSnap.data().wip) || 0;
        const newWip =
          Number(wip) - Number(history.quantity) + Number(items.quantity);
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
          price: Number(items.price),
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
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

  // 生地染色　確定処理
  const confirmProcessingFabricDyeing = async (history: History, items: History) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;
    setIsLoading(true);

    const productDocRef = doc(db, "products", history.productId);
    const orderHistoryDocRef = doc(db, "fabricDyeingOrders", history.id);
    const confirmHistoryDocRef = doc(collection(db, "fabricDyeingConfirms"));

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        const newWip =
          (await productDocSnap.data()?.wip) -
          Number(history.quantity) +
          Number(items.remainingOrder) || 0;

        const newStock =
          (await productDocSnap.data()?.externalStock) +
          Number(items.quantity) || 0;
        transaction.update(productDocRef, {
          wip: newWip,
          externalStock: newStock,
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
          price: Number(history.price),
          quantity: Number(items.quantity),
          comment: items.comment,
          orderedAt: items.orderedAt || history.orderedAt,
          fixedAt: items.fixedAt || getTodayDate(),
          createUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      router.push("/products/fabric-dyeing/confirms");
    }
  };
  return {
    updateFabricDyeingConfirm,
    deleteFabricDyeingOrderStock,
    deleteFabricDyeingOrderRanning,
    updateFabricDyeingOrderStock,
    updateFabricDyeingOrderRanning,
    confirmProcessingFabricDyeing
  }
}
