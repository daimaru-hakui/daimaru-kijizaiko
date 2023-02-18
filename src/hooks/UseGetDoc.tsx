import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect,useState } from 'react';
import { db } from '../../firebase';
import { ProductType } from '../../types/FabricType';
export const useGetDoc = (id: string) => {
  const [product,setProduct] = useState({}as ProductType)
  
  useEffect(() => {
    const getProduct = async () => {
      const docRef = doc(db, "products", id);
      try {
        onSnapshot(docRef, (doc) => setProduct({ ...doc.data(), id: doc.id } as ProductType));
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getProduct();
  }, [id]);

  return {product}
}