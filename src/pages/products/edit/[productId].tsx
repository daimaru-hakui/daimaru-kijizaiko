import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import ProductInputArea from "../../../components/products/ProductInputArea";

const ProductsEdit = () => {
  const router = useRouter();
  const productId = router.query.productId;
  const [items, setItems] = useState<any>({});
  const [product, setProduct] = useState<any>();

  // 生地情報の取得
  useEffect(() => {
    const getProduct = async () => {
      const docRef = doc(db, "products", `${productId}`);
      try {
        const docSnap = await getDoc(docRef);
        setItems({ ...docSnap.data(), id: docSnap.id });
        setProduct({ ...docSnap.data(), id: docSnap.id });
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getProduct();
  }, [productId]);

  return (
    <ProductInputArea
      items={items}
      setItems={setItems}
      title={"生地の編集"}
      toggleSwitch={"edit"}
      product={product}
    />
  );
};

export default ProductsEdit;
