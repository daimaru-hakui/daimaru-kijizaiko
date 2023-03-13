import { Text } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import {
  grayFabricsState,
  productsState,
  suppliersState,
  usersState,
} from "../../store";
import { ProductType } from "../../types/FabricType";
import { MaterialsType } from "../../types/MaterialsType";

export const useGetDisp = () => {
  const users = useRecoilValue(usersState);
  const suppliers = useRecoilValue(suppliersState);
  const products = useRecoilValue(productsState);
  const grayFabrics = useRecoilValue(grayFabricsState);

  // 混率の表示
  const getMixed = (materials: MaterialsType) => {
    let array = [];
    const t = materials.t ? `ポリエステル${materials.t}% ` : "";
    const c = materials.c ? `綿${materials.c}% ` : "";
    const n = materials.n ? `ナイロン${materials.n}% ` : "";
    const r = materials.r ? `レーヨン${materials.r}% ` : "";
    const h = materials.h ? `麻${materials.h}% ` : "";
    const pu = materials.pu ? `ポリウレタン${materials.pu}% ` : "";
    const w = materials.w ? `ウール${materials.w}% ` : "";
    const ac = materials.ac ? `アクリル${materials.ac}% ` : "";
    const cu = materials.cu ? `キュプラ${materials.cu}% ` : "";
    const si = materials.si ? `シルク${materials.si}% ` : "";
    const as = materials.as ? `アセテート${materials.as}% ` : "";
    const z = materials.z ? `指定外繊維${materials.z}% ` : "";
    const f = materials.f ? `複合繊維${materials.f}% ` : "";
    array.push(t, c, n, r, h, pu, w, ac, cu, si, z, f);
    return array.filter((item) => item);
  };

  // 規格の表示
  const getFabricStd = (
    fabricWidth: number,
    fabricLength: number,
    fabricWeight: number | null
  ) => {
    const width = fabricWidth ? `巾:${fabricWidth}cm` : "";
    const length = fabricLength ? `長さ:${fabricLength}m` : "";
    const weigth = fabricWeight ? `重さ:${fabricWeight}` : "";
    const mark = width && length ? "×" : "";
    const space = weigth ? " " : "";
    return width + mark + length + space + weigth;
  };

  const getSerialNumber = (serialNumber: number) => {
    const str = "0000000000" + String(serialNumber);
    return str.slice(-10);
  };

  // 担当者の表示
  const getUserName = (userId: string) => {
    if (userId === "R&D") {
      return "R&D";
    } else {
      const user = users.find((user: { uid: string }) => userId === user.uid);
      return user?.name || "";
    }
  };

  // 仕入れ先の表示
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(
      (supplier: { id: string }) => supplier.id === supplierId
    );
    return supplier?.name || "";
  };

  const getProductNumber = (productId: string) => {
    const result = products.find(
      (product: ProductType) => product.id === productId
    );
    return result?.productNumber || productId;
  };

  const getProductName = (productId: string) => {
    const result = products.find(
      (product: ProductType) => product.id === productId
    );
    return result?.productName || "";
  };

  const getColorName = (productId: string) => {
    const result = products.find(
      (product: ProductType) => product.id === productId
    );
    return result?.colorName || productId;
  };

  const getGrayFabricNumber = (grayFabricId: string) => {
    const grayFabric = grayFabrics.find(
      (grayFabric: { id: string }) => grayFabricId === grayFabric.id
    );
    return grayFabric?.productNumber || grayFabricId;
  };

  const getGrayFabricName = (grayFabricId: string) => {
    const grayFabric = grayFabrics.find(
      (grayFabric: { id: string }) => grayFabricId === grayFabric.id
    );
    return grayFabric?.productName || grayFabricId;
  };

  // キバタ在庫を取得
  const getGrayFabricStock = (grayFabricId: string) => {
    const grayFabric = grayFabrics.find(
      (grayFabric: { id: string }) => grayFabric.id === grayFabricId
    );
    const stock = grayFabric?.stock || 0;
    return stock;
  };

  // 徳島在庫数を取得
  const getTokushimaStock = (productId: string) => {
    const stock = products.find(
      (product: ProductType) => product.id === productId
    );
    return stock?.tokushimaStock || 0;
  };

  const getPrice = (productId: string) => {
    const product = products.find(
      (product: ProductType) => product.id === productId
    );
    return product?.price || 0;
  };

  return {
    getSerialNumber,
    getUserName,
    getMixed,
    getFabricStd,
    getSupplierName,
    getProductNumber,
    getColorName,
    getProductName,
    getGrayFabricName,
    getGrayFabricNumber,
    getGrayFabricStock,
    getTokushimaStock,
    getPrice,
  };
};
