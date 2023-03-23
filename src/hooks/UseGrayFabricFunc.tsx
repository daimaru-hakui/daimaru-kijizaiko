import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../firebase";
import { currentUserState, loadingState } from "../../store";
import { GrayFabricType } from "../../types/GrayFabricType";
import { useUtil } from "./UseUtil";

export const useGrayFabricFunc = () => {
  const currentUser = useRecoilValue(currentUserState);
  const setLoading = useSetRecoilState(loadingState);
  const router = useRouter();
  const { mathRound2nd } = useUtil();

  const addGrayFabric = async (data: GrayFabricType) => {
    const result = window.confirm("登録して宜しいでしょうか。");
    if (!result) return;
    const grayFabricsCollectionRef = collection(db, "grayFabrics");
    try {
      setLoading(true);
      await addDoc(grayFabricsCollectionRef, {
        productName: data?.productName || "",
        productNumber: data?.productNumber || "",
        supplierId: data?.supplierId || "",
        price: Number(data?.price) || 0,
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
      setLoading(false);
    }
  };

  const updateGrayFabric = async (data: GrayFabricType, grayFabricId: string) => {
    const result = window.confirm("更新して宜しいでしょうか。");
    if (!result) return;
    const grayFabricsDocnRef = doc(db, "grayFabrics", grayFabricId);
    try {
      setLoading(true);
      await updateDoc(grayFabricsDocnRef, {
        productName: data?.productName || "",
        productNumber: data?.productNumber || "",
        supplierId: data?.supplierId || "",
        price: Number(data?.price) || 0,
        comment: data?.comment || "",
        wip: 0,
        stock: 0,
        updateUser: currentUser,
        updatedAt: serverTimestamp(),
      });
      router.push("/gray-fabrics");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
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

  const updateAjustmentGrayFabric = async (data: GrayFabricType, grayFabricId: string) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return {
    addGrayFabric,
    updateGrayFabric,
    deleteGrayFabric,
    updateAjustmentGrayFabric,
  };
};
