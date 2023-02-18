import { ProductType } from "../../../types/FabricType";
import ProductInputArea from "../../components/products/ProductInputArea";

const ProductsNew = () => {
  return (
    <ProductInputArea
      title={"生地の登録"}
      toggleSwitch={"new"}
      product={{} as ProductType}
      onClose={() => { }}
    />
  );
};

export default ProductsNew;
