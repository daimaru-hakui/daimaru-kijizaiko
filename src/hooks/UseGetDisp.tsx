import { useCallback } from "react";
import {
  useAuthStore,
  useCuttingScheduleStore,
  useGrayFabricStore,
  useProductsStore,
  useSettingStore,
} from "../../store";
import { Materials, Location } from "../../types";
import { useUtil } from "./UseUtil";

export const useGetDisp = () => {
  const users = useAuthStore((state) => state.users);
  const products = useProductsStore((state) => state.products);
  const grayFabrics = useGrayFabricStore((state) => state.grayFabrics);
  const suppliers = useSettingStore((state) => state.suppliers);
  const locations = useSettingStore((state) => state.locations);
  const cuttingSchedules = useCuttingScheduleStore(
    (state) => state.cuttingSchedules
  );
  const { mathRound2nd } = useUtil();

  // 混率の表示
  const getMixed = useCallback((materials: Materials) => {
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
  }, []);

  // 規格の表示
  const getFabricStd = useCallback(
    (
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
    },
    []
  );

  const getSerialNumber = useCallback((serialNumber: number) => {
    const str = "0000000000" + String(serialNumber);
    return str.slice(-10);
  }, []);

  console.log("user");
  // 担当者の表示
  const getUserName = useCallback(
    (userId: string) => {
      if (userId === "R&D") return "R&D";
      const user = users.find((user) => userId === user.uid);
      if (user) {
        return user.name;
      } else {
        return "";
      }
    },
    [users]
  );

  // 仕入れ先の表示
  const getSupplierName = useCallback(
    (supplierId: string) => {
      const supplier = suppliers.find((supplier) => supplier.id === supplierId);
      return supplier?.name || "";
    },
    [suppliers]
  );

  const getProductNumber = useCallback(
    (productId: string) => {
      const result = products.find((product) => product.id === productId);
      return result?.productNumber || productId;
    },
    [products]
  );

  const getProductName = useCallback(
    (productId: string) => {
      const result = products.find((product) => product.id === productId);
      return result?.productName || "";
    },
    [products]
  );

  const getColorName = useCallback(
    (productId: string) => {
      const result = products.find((product) => product.id === productId);
      return result?.colorName || productId;
    },
    [products]
  );

  const getGrayFabricNumber = useCallback(
    (grayFabricId: string) => {
      const grayFabric = grayFabrics.find(
        (grayFabric) => grayFabricId === grayFabric.id
      );
      return grayFabric?.productNumber || grayFabricId;
    },
    [grayFabrics]
  );

  const getGrayFabricName = useCallback(
    (grayFabricId: string) => {
      const grayFabric = grayFabrics.find(
        (grayFabric) => grayFabricId === grayFabric.id
      );
      return grayFabric?.productName || grayFabricId;
    },
    [grayFabrics]
  );

  // キバタ在庫を取得
  const getGrayFabricStock = useCallback(
    (grayFabricId: string) => {
      const grayFabric = grayFabrics.find(
        (grayFabric) => grayFabric.id === grayFabricId
      );
      const stock = grayFabric?.stock || 0;
      return stock;
    },
    [grayFabrics]
  );

  // 徳島在庫数を取得
  const getTokushimaStock = useCallback(
    (productId: string) => {
      const stock = products.find((product) => product.id === productId);
      return mathRound2nd(stock?.tokushimaStock) || 0;
    },
    [mathRound2nd, products]
  );

  const getPrice = useCallback(
    (productId: string) => {
      const product = products.find((product) => product.id === productId);
      return product?.price || 0;
    },
    [products]
  );

  const getLocation = useCallback(
    (locationId: string) => {
      const location = locations.find(
        (location: Location) => location.id === locationId
      );
      return location?.name || "";
    },
    [locations]
  );

  const getCuttingScheduleTotal = useCallback(
    (array: string[]) => {
      const filterSchedules = cuttingSchedules.filter((schedule) =>
        array?.includes(schedule.id)
      );
      let total = 0;
      filterSchedules.forEach(({ quantity }) => {
        total += quantity;
      });
      return total || 0;
    },
    [cuttingSchedules]
  );

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
    getCuttingScheduleTotal,
  };
};
