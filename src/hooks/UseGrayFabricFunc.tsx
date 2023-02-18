import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../firebase";
import { currentUserState, loadingState } from "../../store";
import { GrayFabricType } from "../../types/GrayFabricType";

export const useGrayFabricFunc = (items: GrayFabricType | null, setItems: Function | null) => {
  const currentUser = useRecoilValue(currentUserState);
  const setLoading = useSetRecoilState(loadingState);
  const router = useRouter();

  const addGrayFabric = async () => {
    const result = window.confirm("登録して宜しいでしょうか。");
    if (!result) return;
    const grayFabricsCollectionRef = collection(db, "grayFabrics");
    try {
      setLoading(true);
      await addDoc(grayFabricsCollectionRef, {
        productName: items?.productName || "",
        productNumber: items?.productNumber || "",
        supplierId: items?.supplierId || "",
        price: Number(items?.price) || 0,
        comment: items?.comment || "",
        wip: 0,
        stock: 0,
        createUser: currentUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      router.push("/gray-fabrics");
    }
  };

  const updateGrayFabric = async (grayFabricId: string) => {
    const result = window.confirm("更新して宜しいでしょうか。");
    if (!result) return;
    const grayFabricsDocnRef = doc(db, "grayFabrics", grayFabricId);
    try {
      setLoading(true);
      await updateDoc(grayFabricsDocnRef, {
        productName: items?.productName || "",
        productNumber: items?.productNumber || "",
        supplierId: items?.supplierId || "",
        price: Number(items?.price) || 0,
        comment: items?.comment || "",
        wip: 0,
        stock: 0,
        updateUser: currentUser,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      // reset();
      // onClose();
      router.push("/gray-fabrics");
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

  const reset = (grayFabric: GrayFabricType) => {
    setItems(grayFabric);
  };

  return { addGrayFabric, updateGrayFabric, deleteGrayFabric, reset }
}