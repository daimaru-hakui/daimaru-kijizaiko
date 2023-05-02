import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../../firebase";
import { useAuthStore, useLoadingStore } from "../../store";
import { GrayFabric } from "../../types";
import { useUtil } from "./UseUtil";

export const useGrayFabricFunc = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const router = useRouter();
  const { mathRound2nd } = useUtil();

  const addGrayFabric = async (data: GrayFabric) => {
    const result = window.confirm("登録して宜しいでしょうか。");
    if (!result) return;
    const grayFabricsCollectionRef = collection(db, "grayFabrics");
    try {
      setIsLoading(true);
      await addDoc(grayFabricsCollectionRef, {
        productName: data?.productName || "",
        productNumber: data?.productNumber || "",
        supplierId: data?.supplierId || "",
        comment: data?.comment || "",
        wip: 0,
        stock: 0,
        createUser: currentUser,
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
    try {
      setIsLoading(true);
      await updateDoc(grayFabricsDocnRef, {
        productName: data?.productName || "",
        productNumber: data?.productNumber || "",
        supplierId: data?.supplierId || "",
        comment: data?.comment || "",
        updateUser: currentUser,
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
      await updateDoc(docRef, {
        price: Number(data.price),
        wip: mathRound2nd(Number(data.wip)),
        stock: mathRound2nd(Number(data.stock)),
        updatedAt: serverTimestamp(),
        updateUser: currentUser,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addGrayFabric,
    updateGrayFabric,
    deleteGrayFabric,
    updateAjustmentGrayFabric,
  };
};
