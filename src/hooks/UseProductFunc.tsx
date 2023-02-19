import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../firebase";
import { currentUserState, loadingState } from "../../store";
import { ProductType } from "../../types/FabricType";
import { useGetDisp } from "./UseGetDisp";

export const useProductFunc = (items: ProductType | null, setItems: Function | null) => {
  const router = useRouter();
  const setLoading = useSetRecoilState(loadingState);
  const currentUser = useRecoilValue(currentUserState);
  const { getSupplierName } = useGetDisp();

  const obj = {
    productType: items?.productType || 1,
    staff: items?.productType === 2 ? items?.staff : "R&D",
    supplierId: items?.supplierId || "",
    supplierName: getSupplierName(items?.supplierId) || "",
    grayFabricId: items?.grayFabricId || "",
    productNumber:
      items?.productNum + (items?.colorNum ? "-" + items?.colorNum : "") || "",
    productNum: items?.productNum || "",
    productName: items?.productName || "",
    colorNum: items?.colorNum || "",
    colorName: items?.colorName || "",
    price: Number(items?.price) || 0,
    materialName: items?.materialName || "",
    materials: items?.materials || {},
    fabricWidth: items?.fabricWidth || "",
    fabricWeight: items?.fabricWeight || "",
    fabricLength: items?.fabricLength || "",
    features: items?.features || [],
    noteProduct: items?.noteProduct || "",
    noteFabric: items?.noteFabric || "",
    noteEtc: items?.noteEtc || "",
    wip: 0,
    externalStock: 0,
    arrivingQuantity: 0,
    tokushimaStock: 0,
    deletedAt: "",
  };

  // 生地登録
  const addProduct = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const docRef = collection(db, "products");
    try {
      await addDoc(docRef, {
        ...obj,
        createUser: currentUser,
        updateUser: currentUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      router.push("/products");
    }
  }

  const updateProduct = async (productId: string) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const docRef = doc(db, "products", `${productId}`);
    try {
      await updateDoc(docRef, {
        ...obj,
        updateUser: currentUser,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      // onclose();
    }
  };

  const updateAjustmentProduct = async (productId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "products", productId);
      await updateDoc(docRef, {
        price: Number(items.price),
        tokushimaStock: Number(items.tokushimaStock),
        updatedAt: serverTimestamp(),
        updateUser: currentUser
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 物理削除
  const deleteProduct = async (productId: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "products", productId);
    await deleteDoc(docRef);
  };

  // 論理削除
  // const deleteProduct = async (id: string) => {
  //   const result = window.confirm("削除して宜しいでしょうか");
  //   if (!result) return;
  //   try {
  //     const docRef = doc(db, "products", `${id}`);

  //     await updateDoc(docRef, {
  //       deletedAt: serverTimestamp(),
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //   }
  // };

  const onReset = (product: ProductType) => {
    setItems({ ...product });
  };

  return { addProduct, updateProduct, updateAjustmentProduct, deleteProduct, onReset }
}