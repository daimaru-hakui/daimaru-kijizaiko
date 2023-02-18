import { Text } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { grayFabricsState, productsState, suppliersState, usersState } from "../../store";
import { MaterialsType } from "../../types/MaterialsType";
// import { ProductType } from "../../types/ProductType";

export const useGetDisp = () => {
  const users = useRecoilValue(usersState);
  const suppliers = useRecoilValue(suppliersState);
  const products = useRecoilValue(productsState)
  const grayFabrics = useRecoilValue(grayFabricsState)

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
    const z = materials.z ? `指定外繊維${materials.z}% ` : "";
    const f = materials.f ? `複合繊維${materials.f}% ` : "";
    array.push(t, c, n, r, h, pu, w, ac, cu, si, z, f);

    return array
      .filter((item) => item)
      .map((item) => <Text key={item}>{item}</Text>);
  };

  const getSerialNumber = (serialNumber: number) => {
    const str = "0000000" + String(serialNumber);
    return str.slice(-7);
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
    return (
      <>
        <Text>{width}</Text>
        <Text>{mark}</Text>
        <Text>{length}</Text>
        <Text ml={3}>{weigth}</Text>
      </>
    );
  };

  // 仕入れ先の表示
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(
      (supplier: { id: string }) => supplier.id === supplierId
    );
    return supplier?.name;
  };

  const getProductNumber = (productId: string) => {
    const result = products.find((product: any) => product.id === productId);
    return `${result?.productNumber}`;
  };

  const getColorName = (productId: string) => {
    const result = products.find((product: any) => product.id === productId);
    return `${result?.colorName}`;
  };
  const getProductName = (productId: string) => {
    const result = products.find((product: any) => product.id === productId);
    return `${result?.productName}`;
  };

  const getGrayFabricName = (id: string) => {
    const grayFabric = grayFabrics.find(
      (grayFabric: { id: string }) => id === grayFabric.id
    );
    return `${grayFabric?.productName}`;
  };

  const getGrayFabricNumber = (id: string) => {
    const grayFabric = grayFabrics.find(
      (grayFabric: { id: string }) => id === grayFabric.id
    );
    return `${grayFabric?.productNumber}`;
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
    getGrayFabricNumber
  }
}