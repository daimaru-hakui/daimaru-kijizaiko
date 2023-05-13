import React from 'react'
import { GrayFabric, GrayFabricHistory } from '../../types';
import { addDoc, collection, deleteDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthStore } from '../../store';
import { useUtil } from './UseUtil';
import { useSWRGrayFavricConfirms } from './swr/useSWRGrayFavricConfirms';
import { useRouter } from 'next/router';
import { useGetDisp } from './UseGetDisp';

type Inputs = {
  quantity: number,
  price: number,
  orderedAt: string;
  scheduledAt: string;
  fixedAt: string;
  comment: string;
};

export const useGrayFabrics = (startDay?:string, endDay?:string) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const router = useRouter()
  const { getTodayDate } = useUtil();
  const { data, mutate } = useSWRGrayFavricConfirms(startDay, endDay);
  const {getSupplierName} = useGetDisp()

   // キバタ仕掛発注
  const orderGrayFabric = async (items:Inputs, grayFabric:GrayFabric) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const grayFabricDocRef = doc(db, "grayFabrics", grayFabric.id);
    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "grayFabricOrderNumbers"
    );
    const orderHistoryRef = collection(db, "grayFabricOrders");

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists()) throw "serialNumbers does not exist!";

        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabricOrders does not exist!";

        const newSerialNumber = orderNumberDocSnap.data().serialNumber + 1;
        transaction.update(orderNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        const newWipGrayFabric =
          grayFabricDocSnap.data()?.wip + items.quantity || 0;
        transaction.update(grayFabricDocRef, {
          wip: newWipGrayFabric,
        });

        await addDoc(orderHistoryRef, {
          serialNumber: newSerialNumber,
          grayFabricId: grayFabricDocSnap?.id,
          productNumber: grayFabric?.productNumber,
          productName: grayFabric?.productName,
          price: Number(grayFabric?.price),
          quantity: Number(items.quantity),
          orderedAt: items.orderedAt || getTodayDate(),
          scheduledAt: items.scheduledAt || getTodayDate(),
          comment: items.comment,
          createUser: currentUser,
          supplierId: grayFabric?.supplierId,
          supplierName: getSupplierName(grayFabric?.supplierId),
          createdAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      router.push("/gray-fabrics/orders");
    }
  };

   // キバタ仕掛から削除
  const deleteGrayFabricOrder = async (history: GrayFabricHistory) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const orderHistoryRef = doc(db, "grayFabricOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "Document does not exist!!";

        const newWip =
          (await grayFabricDocSnap.data()?.wip) - Number(history.quantity);
        transaction.update(grayFabricDocRef, {
          wip: newWip,
        });

        await deleteDoc(orderHistoryRef);
      });
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  const updateOrderHistory = async (history: GrayFabricHistory, items:Inputs) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const historyDocRef = doc(db, "grayFabricOrders", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "Document does not exist!!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "Document does not exist!!";

        const newWip =
          (await grayFabricDocSnap.data()?.wip) -
          history.quantity +
          Number(items.quantity) || 0;
        transaction.update(grayFabricDocRef, {
          wip: newWip,
        });

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
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
    }
  };

  const updateConfirmHistory = async (history: GrayFabricHistory, items:Inputs) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const historyDocRef = doc(db, "grayFabricConfirms", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabricDocSnap does not exist!!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "historyDocSnap does not exist!";

        const newStock =
          (await grayFabricDocSnap.data()?.stock) -
          history.quantity +
          Number(items.quantity) || 0;
        
        transaction.update(grayFabricDocRef, {
          stock: newStock,
        });

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
          orderedAt: items.orderedAt,
          fixedAt: items.fixedAt,
          comment: items.comment,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      mutate({ ...data });
    }
  };

  // 確定処理　キバタ仕掛⇒キバタ在庫
  const confirmProcessing = async (history: GrayFabricHistory,items) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history?.grayFabricId);
    const orderHistoryRef = doc(db, "grayFabricOrders", history.id);
    const confirmHistoryDocRef = doc(collection(db, "grayFabricConfirms"));

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "Document does not exist!!";

        const newWip =
          grayFabricDocSnap.data()?.wip -
          Number(history.quantity) +
          Number(items.remainingOrder) || 0;
        const newStock =
          grayFabricDocSnap.data()?.stock + Number(items.quantity) || 0;
        transaction.update(grayFabricDocRef, {
          wip: newWip,
          stock: newStock,
        });

        transaction.update(orderHistoryRef, {
          quantity: items.remainingOrder,
          orderedAt: items.orderedAt || getTodayDate(),
          scheduledAt: items.scheduledAt || getTodayDate(),
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });

        transaction.set(confirmHistoryDocRef, {
          serialNumber: history.serialNumber,
          grayFabricId: history.grayFabricId,
          orderedAt: items.orderedAt || history.orderedAt,
          fixedAt: items.fixedAt || getTodayDate(),
          createUser: currentUser,
          productNumber: history.productNumber,
          productName: history.productName,
          supplierId: history.supplierId,
          supplierName: history.supplierName,
          quantity: items.quantity,
          comment: items.comment,
          createdAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
    }
  };
  return {
    orderGrayFabric,
    deleteGrayFabricOrder,
    updateOrderHistory,
    updateConfirmHistory,
    confirmProcessing
  };
}
