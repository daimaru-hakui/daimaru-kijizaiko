import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Product } from '../../../types';
import { useQuery } from 'react-query';

export const useProducts = () => {
   
  const getProducts = async () => {
    let data:Product[] = [];
    const q = query(collection(db, "products"), where("deletedAt", "==", ""));
    onSnapshot(q, (querySnap) =>
      querySnap.docs.forEach((doc) => (
        data.push({ ...doc.data(), id: doc.id } as Product)
      )));
    return data
  };

  
  return useQuery({
    queryKey:['products'],
    queryFn: getProducts
  })
}
