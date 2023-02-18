import { useState } from "react";
import { ProductType } from "../../../types/FabricType";
// import { ProductType } from "../../../types/ProductType";
import ProductInputArea from "../../components/products/ProductInputArea";

const ProductsNew = () => {
  const [items, setItems] = useState({
    productNum: "",
    colorNum: "",
    colorName: "",
  } as any);

  return (
    <ProductInputArea
      // items={items}
      // setItems={setItems}
      title={"生地の登録"}
      toggleSwitch={"new"}
      product={{} as ProductType}
      onClose={() => { }}
    />
  );
};

export default ProductsNew;
