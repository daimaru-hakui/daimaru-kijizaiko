import React, { useState } from "react";
import { ProductType } from "../../../types/productType";
import ProductInputArea from "../../components/products/ProductInputArea";

const ProductsNew = () => {
  const [items, setItems] = useState({} as ProductType);

  return (
    <ProductInputArea
      items={items}
      setItems={setItems}
      title={"生地の登録"}
      toggleSwitch={"new"}
      product={{}}
    />
  );
};

export default ProductsNew;
