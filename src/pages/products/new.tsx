import React, { useState } from "react";
import ProductInputArea from "../../components/products/ProductInputArea";

const ProductsNew = () => {
  const [items, setItems] = useState<any>({
    productType: 1,
    staff: "",
    supplierId: "",
    grayFabricId: "",
    productNumber: "",
    productNum: "",
    productName: "",
    colorNum: "",
    color: "",
    price: "",
    materialName: "",
    materials: "",
    fabricWidth: 0,
    fabricWeight: 0,
    fabricLength: 0,
    features: [],
    noteProduct: "",
    noteFabric: "",
    noteEtc: "",
  });

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
