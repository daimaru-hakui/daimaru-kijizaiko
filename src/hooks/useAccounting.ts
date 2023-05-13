import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { History } from '../../types';
import { useAuthStore } from '../../store';
import { useSWRPurchaseConfirms } from './swr/useSWRPurchaseConfirms';


type Inputs = {
  quantity: number,
  price: number,
  orderedAt: string;
  fixedAt: string;
  comment: string;
};

export const useAccounting = (startDay:string, endDay:string) => {
  const HOUSE_FACTORY = "徳島工場";
  const currentUser = useAuthStore((state) => state.currentUser);
  const { data, mutate } = useSWRPurchaseConfirms(startDay, endDay);

   const updateHistoryAccountingOrder = async (
     history: History,
     inputData: Inputs,
  ) => {
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricPurchaseConfirms", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockPlace === HOUSE_FACTORY) {
          const stock = productDocSnap.data().tokushimaStock || 0;
          const newStock = stock - history.quantity + Number(inputData.quantity);
          transaction.update(productDocRef, {
            tokushimaStock: Number(newStock),
          });
        }

        transaction.update(historyDocRef, {
          quantity: Number(inputData.quantity),
          price: Number(inputData.price),
          orderedAt:inputData.orderedAt,
          fixedAt: inputData.fixedAt,
          comment: inputData.comment,
          updateUser: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      mutate({ ...data });
    }
  };

   const confirmProcessingAccounting = async (
    history: History,
    inputData: Inputs
  ) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const confirmHistoryDocRef = doc(db, "fabricPurchaseConfirms", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        if (history.stockPlace === HOUSE_FACTORY) {
          const stock = productDocSnap.data().tokushimaStock || 0;
          const newStock = stock - history.quantity + Number(inputData.quantity);
          transaction.update(productDocRef, {
            tokushimaStock: newStock,
          });
        }

        transaction.update(confirmHistoryDocRef, {
          quantity: Number(inputData.quantity),
          price: Number(inputData.price),
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
          accounting: true,
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
       mutate({ ...data });
    }
  };

  return {
    updateHistoryAccountingOrder,
    confirmProcessingAccounting
  }
}
