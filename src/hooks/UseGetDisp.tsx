import { useRecoilValue } from "recoil";
import {
  grayFabricsState,
  locationsState,
  suppliersState,
  useAuthStore,
  useProductsStore,
} from "../../store";
import { MaterialsType, LocationType } from "../../types";

export const useGetDisp = () => {
  const users = useAuthStore((state) => state.users);
  const products = useProductsStore((state) => state.products);
  const suppliers = useRecoilValue(suppliersState);
  const grayFabrics = useRecoilValue(grayFabricsState);
  const locations = useRecoilValue(locationsState);

  // 混率の表示
  const getMixed = (materials: MaterialsType) => {
    let array = [];
    const t = materials?.t ? `ポリエステル${materials.t}% ` : "";
    const c = materials?.c ? `綿${materials.c}% ` : "";
    const n = materials?.n ? `ナイロン${materials.n}% ` : "";
    const r = materials?.r ? `レーヨン${materials.r}% ` : "";
    const h = materials?.h ? `麻${materials.h}% ` : "";
    const pu = materials?.pu ? `ポリウレタン${materials.pu}% ` : "";
    const w = materials?.w ? `ウール${materials.w}% ` : "";
    const ac = materials?.ac ? `アクリル${materials.ac}% ` : "";
    const cu = materials?.cu ? `キュプラ${materials.cu}% ` : "";
    const si = materials?.si ? `シルク${materials.si}% ` : "";
    const as = materials?.as ? `アセテート${materials.as}% ` : "";
    const z = materials?.z ? `指定外繊維${materials.z}% ` : "";
    const f = materials?.f ? `複合繊維${materials.f}% ` : "";
    array.push(t, c, n, r, h, pu, w, ac, cu, si, as, z, f);
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
      const user = users.find((user) => userId === user.uid);
      return user?.name || "";
    }
  };

  // 仕入れ先の表示
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((supplier) => supplier.id === supplierId);
    return supplier?.name || "";
  };

  const getProductNumber = (productId: string) => {
    const result = products.find((product) => product.id === productId);
    return result?.productNumber || productId;
  };

  const getProductName = (productId: string) => {
    const result = products.find((product) => product.id === productId);
    return result?.productName || "";
  };

  const getColorName = (productId: string) => {
    const result = products.find((product) => product.id === productId);
    return result?.colorName || productId;
  };

  const getGrayFabricNumber = (grayFabricId: string) => {
    const grayFabric = grayFabrics.find(
      (grayFabric) => grayFabricId === grayFabric.id
    );
    return grayFabric?.productNumber || grayFabricId;
  };

  const getGrayFabricName = (grayFabricId: string) => {
    const grayFabric = grayFabrics.find(
      (grayFabric) => grayFabricId === grayFabric.id
    );
    return grayFabric?.productName || grayFabricId;
  };

  // キバタ在庫を取得
  const getGrayFabricStock = (grayFabricId: string) => {
    const grayFabric = grayFabrics.find(
      (grayFabric) => grayFabric.id === grayFabricId
    );
    const stock = grayFabric?.stock || 0;
    return stock;
  };

  // 徳島在庫数を取得
  const getTokushimaStock = (productId: string) => {
    const stock = products.find((product) => product.id === productId);
    return stock?.tokushimaStock || 0;
  };

  const getPrice = (productId: string) => {
    const product = products.find((product) => product.id === productId);
    return product?.price || 0;
  };

  const getLocation = (locationId: string) => {
    const location = locations.find(
      (location: LocationType) => location.id === locationId
    );
    return location?.name || "";
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
    getLocation,
  };
};
