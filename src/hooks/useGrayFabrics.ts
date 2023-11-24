import { GrayFabric, GrayFabricHistory } from '../../types';
import { addDoc, collection, deleteDoc, doc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthStore, useLoadingStore } from '../../store';
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

export const useGrayFabrics = (startDay?: string, endDay?: string) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const router = useRouter();
  const { getTodayDate, mathRound2nd } = useUtil();
  const { data, mutate } = useSWRGrayFavricConfirms(startDay, endDay);
  const { getSupplierName } = useGetDisp();
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);

  const addGrayFabric = async (data: GrayFabric) => {
    const result = window.confirm("登録して宜しいでしょうか。");
    if (!result) return;
    const grayFabricsCollectionRef = collection(db, "grayFabrics");
    const userRef = doc(db, 'users', currentUser);
    const supplierRef = data.supplierId ? doc(db, "suppliers", data.supplierId) : "";
    try {
      setIsLoading(true);
      await addDoc(grayFabricsCollectionRef, {
        productName: data?.productName || "",
        productNumber: data?.productNumber || "",
        supplierId: data?.supplierId || "",
        supplierRef,
        comment: data?.comment || "",
        wip: 0,
        stock: 0,
        createUser: currentUser,
        createUserRef: userRef,
        updateUser: currentUser,
        updateUserRef: userRef,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push("/gray-fabrics");
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGrayFabric = async (
    data: GrayFabric,
    grayFabricId: string
  ) => {
    const result = window.confirm("更新して宜しいでしょうか。");
    if (!result) return;
    const grayFabricsDocnRef = doc(db, "grayFabrics", grayFabricId);
    const userRef = doc(db, 'users', currentUser);
    const supplierRef = data.supplierId ? doc(db, "suppliers", data.supplierId) : "";
    try {
      setIsLoading(true);
      await updateDoc(grayFabricsDocnRef, {
        productName: data?.productName || "",
        productNumber: data?.productNumber || "",
        supplierId: data?.supplierId || "",
        supplierRef,
        comment: data?.comment || "",
        updateUser: currentUser,
        updateUserRef: userRef,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGrayFabric = async (id: string) => {
    let result = window.confirm("削除して宜しいでしょうか。");
    if (!result) return;

    result = window.confirm("本当に削除して宜しいでしょうか。");
    if (!result) return;

    const docRef = doc(db, "grayFabrics", id);
    await deleteDoc(docRef);
  };

  const updateAjustmentGrayFabric = async (
    data: GrayFabric,
    grayFabricId: string
  ) => {
    setIsLoading(true);
    try {
      const docRef = doc(db, "grayFabrics", grayFabricId);
      const userRef = doc(db, 'users', currentUser);
      const createUserRef = doc(db, 'users', data.createUser);
      const supplierRef = data.supplierId ? doc(db, "suppliers", data.supplierId) : "";
      await updateDoc(docRef, {
        price: Number(data.price),
        wip: mathRound2nd(Number(data.wip)),
        stock: mathRound2nd(Number(data.stock)),
        updatedAt: serverTimestamp(),
        updateUser: currentUser,
        updateUserRef: userRef,
        createUserRef, // 一時的
        supplierRef// 一時的
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };


  // キバタ仕掛発注
  const orderGrayFabric = async (items: Inputs, grayFabric: GrayFabric) => {
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
          Number(grayFabricDocSnap.data()?.wip) + Number(items.quantity) || 0;
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

  const updateOrderHistory = async (history: GrayFabricHistory, items: Inputs) => {
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

  const updateConfirmHistory = async (history: GrayFabricHistory, items: Inputs) => {
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
  const confirmProcessing = async (history: GrayFabricHistory, items) => {
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
    addGrayFabric,
    updateGrayFabric,
    deleteGrayFabric,
    updateAjustmentGrayFabric,
    orderGrayFabric,
    deleteGrayFabricOrder,
    updateOrderHistory,
    updateConfirmHistory,
    confirmProcessing
  };
};
