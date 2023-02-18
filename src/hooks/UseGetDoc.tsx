import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { ProductType } from '../../types/FabricType';
import { GrayFabricType } from '../../types/GrayFabricType';
export const useGetDoc = (id: string) => {
  const [product, setProduct] = useState({} as ProductType)
  const [grayFabrics, setGrayFabrics] = useState([] as GrayFabricType[])

  useEffect(() => {
    const getProduct = async () => {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw "データ無し"
      try {
        onSnapshot(docRef, (doc) => setProduct({ ...doc.data(), id: doc.id } as ProductType));
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getProduct();
  }, []);


  return { product }
}