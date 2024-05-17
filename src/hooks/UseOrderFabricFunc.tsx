import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../../firebase";
import { useAuthStore, useLoadingStore } from "../../store";
import { Product, History } from "../../types";
import { useGetDisp } from "./UseGetDisp";
import { useUtil } from "./UseUtil";
import { OrderInputs } from "../components/products/OrderInputArea";

export const useOrderFabricFunc = (
  product: Product,
  orderType: string
) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const router = useRouter();
  const { getSupplierName, getUserName } = useGetDisp();
  const { getTodayDate } = useUtil();
  const grayFabricId = product?.grayFabricId || "";
  const productId = product?.id || "";

  // const Obj = {
  //   stockType: items.stockType,
  //   orderType: orderType,
  //   productId: product?.id,
  //   productNumber: product?.productNumber,
  //   productName: product?.productName,
  //   colorName: product?.colorName,
  //   quantity: Number(items?.quantity),
  //   price: items.price || product.price,
  //   comment: items.comment || "",
  //   supplierId: product.supplierId,
  //   supplierName: getSupplierName(product?.supplierId),
  //   orderedAt: items.orderedAt || getTodayDate(),
  //   scheduledAt: items.scheduledAt || getTodayDate(),
  //   createUser: currentUser,
  //   updateUser: currentUser,
  //   createdAt: serverTimestamp(),
  //   updatedAt: serverTimestamp(),
  // };

  //////////// キバタ在庫から染めOrder依頼 関数//////////////
  const orderFabricDyeingFromStock = async (data: OrderInputs) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setIsLoading(true);

    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "fabricDyeingOrderNumbers"
    );
    const grayFabricDocRef = doc(db, "grayFabrics", grayFabricId);
    const productDocRef = doc(db, "products", productId);
    const historyDocRef = doc(collection(db, "fabricDyeingOrders"));

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists()) throw "serialNumbers does not exist!";

        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "grayFabric does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!";

        const newSerialNumber =
          (await orderNumberDocSnap.data().serialNumber) + 1;
        transaction.update(orderNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        const stockGrayFabric = (await grayFabricDocSnap.data().stock) || 0;
        const newStockGrayFabric = stockGrayFabric - Number(data?.quantity);
        transaction.update(grayFabricDocRef, {
          stock: newStockGrayFabric,
        });

        const wipProduct = (await productDocSnap.data().wip) || 0;
        const newWipProduct = wipProduct + Number(data?.quantity);
        transaction.update(productDocRef, {
          wip: newWipProduct,
        });

        transaction.set(historyDocRef, {
          serialNumber: newSerialNumber,
          stockType: data.stockType,
          orderType: orderType,
          productId: product?.id,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: Number(data?.quantity),
          price: data.price || product.price,
          comment: data.comment || "",
          supplierId: product.supplierId,
          supplierName: getSupplierName(product?.supplierId),
          orderedAt: data.orderedAt || getTodayDate(),
          scheduledAt: data.scheduledAt || getTodayDate(),
          createUser: currentUser,
          updateUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          grayFabricId: grayFabricDocSnap.id,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
      router.push("/products/fabric-dyeing/orders");
    }
  };

  //////////// ランニングキバタから染色Order依頼 関数//////////////
  const orderFabricDyeingFromRanning = async (data: OrderInputs) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setIsLoading(true);

    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "fabricDyeingOrderNumbers"
    );
    const productDocRef = doc(db, "products", productId);
    const historyDocRef = doc(collection(db, "fabricDyeingOrders"));

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists()) throw "serialNumbers does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const newSerialNumber =
          (await orderNumberDocSnap.data().serialNumber) + 1;
        transaction.update(orderNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        const wipProduct = (await productDocSnap.data().wip) || 0;
        const newWipProduct = wipProduct + Number(data?.quantity);
        transaction.update(productDocRef, {
          wip: newWipProduct,
        });

        transaction.set(historyDocRef, {
          serialNumber: newSerialNumber,
          stockType: data.stockType,
          orderType: orderType,
          productId: product?.id,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: Number(data?.quantity),
          price: data.price || product.price,
          comment: data.comment || "",
          supplierId: product.supplierId,
          supplierName: getSupplierName(product?.supplierId),
          orderedAt: data.orderedAt || getTodayDate(),
          scheduledAt: data.scheduledAt || getTodayDate(),
          createUser: currentUser,
          updateUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          grayFabricId: "",
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
      router.push("/products/fabric-dyeing/orders");
    }
  };

  const orderFabricPurchase = async (data: OrderInputs, stockType: string) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setIsLoading(true);

    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "fabricPurchaseOrderNumbers"
    );
    const productDocRef = doc(db, "products", productId);
    const historyDocRef = doc(collection(db, "fabricPurchaseOrders"));
    let serialNumber = "";
    try {
      const a = await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists()) throw "serialNumbers does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const newSerialNumber =
          (await orderNumberDocSnap.data().serialNumber) + 1;
        serialNumber = newSerialNumber;
        transaction.update(orderNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        if (stockType === "stock") {
          const externalStock =
            (await productDocSnap.data().externalStock) || 0;
          const newEternalStock = externalStock - Number(data?.quantity);
          transaction.update(productDocRef, {
            externalStock: newEternalStock,
          });
        }

        const arrivingQuantity =
          (await productDocSnap.data().arrivingQuantity) || 0;
        const newArrivingQuantity = arrivingQuantity + Number(data?.quantity);
        transaction.update(productDocRef, {
          arrivingQuantity: newArrivingQuantity,
        });

        transaction.set(historyDocRef, {
          serialNumber: newSerialNumber,
          stockType: data.stockType,
          orderType: orderType,
          productId: product?.id,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: Number(data?.quantity),
          price: data.price || product.price,
          comment: data.comment || "",
          supplierId: product.supplierId,
          supplierName: getSupplierName(product?.supplierId),
          orderedAt: data.orderedAt || getTodayDate(),
          scheduledAt: data.scheduledAt || getTodayDate(),
          createUser: currentUser,
          updateUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          grayFabricId: "",
          stockPlace: data.stockPlace || "徳島工場",
          accounting: false,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
      // router.push("/products/fabric-purchase/orders");
      router.push({
        pathname: `/complete/${productId}`,
        query: {
          productId: productId || "",
          quantity: data.quantity || 0,
          scheduledAt: data.scheduledAt,
          serialNumber,
          stockPlace: data.stockPlace || "徳島工場",
          createUser: getUserName(currentUser),
        },
      });
    }
  };

  return {
    orderFabricDyeingFromStock,
    orderFabricDyeingFromRanning,
    orderFabricPurchase,
  };
};
