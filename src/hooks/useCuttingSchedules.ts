import {
  arrayRemove,
  arrayUnion,
  doc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { v4 as uuidv4 } from "uuid";

type Inputs = {
  id: string;
  staff: string;
  processNumber: string;
  productId: string;
  itemName: string;
  quantity: number;
  scheduledAt: string;
};

export const useCuttingSchedules = () => {
  const addSchedule = async (data: Inputs) => {
    const userRef = doc(db, "users", data.staff);
    const productRef = doc(db, "products", data.productId);
    const uuid = uuidv4();
    const scheduleRef = doc(db, "cuttingSchedules", uuid);
    try {
      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) {
          throw "生地が登録されていません。";
        }
        transaction.update(productRef, {
          cuttingSchedules: arrayUnion(uuid),
        });

        transaction.set(scheduleRef, {
          staff: data.staff,
          userRef: userRef,
          processNumber: data.processNumber,
          productId: data.productId,
          productRef: productRef,
          itemName: data.itemName,
          quantity: Number(data.quantity) || 0,
          scheduledAt: data.scheduledAt,
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  const updateSchedule = async (data: Inputs) => {
    const userRef = doc(db, "users", data.staff);
    const scheduleRef = doc(db, "cuttingSchedules", data.id);
    try {
      await updateDoc(scheduleRef, {
        staff: data.staff,
        userRef: userRef,
        processNumber: data.processNumber,
        itemName: data.itemName,
        quantity: Number(data.quantity) || 0,
        scheduledAt: data.scheduledAt,
      });
      console.log("成功");
    } catch (e) {
      console.log(e);
    }
  };

  const deleteSchedule = async (id: string, productId: string) => {
    const result = confirm("削除して宜しいでしょうか");
    if (!result) return;
    const scheduleRef = doc(db, "cuttingSchedules", `${id}`);
    const productRef = doc(db, "products", `${productId}`);
    try {
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(scheduleRef);
        if (!docSnap.exists) {
          throw "データが登録されていません。";
        }
        transaction.update(productRef, {
          cuttingSchedules: arrayRemove(id),
        });
        transaction.delete(scheduleRef);
      });
    } catch (error) {
      console.log(error);
    }
  };

  return { addSchedule, updateSchedule, deleteSchedule };
};
