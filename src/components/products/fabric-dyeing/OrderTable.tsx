import {
  Box,
  Button,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useRecoilValue, useSetRecoilState } from "recoil";
import CommentModal from "../../CommentModal";
import { HistoryType } from "../../../../types/HistoryType";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { useAuthManagement } from "../../../hooks/UseAuthManagement";
import { useUtil } from "../../../hooks/UseUtil";
import {
  currentUserState,
  fabricDyeingOrdersState,
  loadingState,
  usersState,
} from "../../../../store";
import { db } from "../../../../firebase";
import { HistoryEditModal } from "../../history/HistoryEditModal";
import OrderToConfirmModal from "../../history/OrderToConfirmModal";
import { useRouter } from "next/router";
// import useSWR from "swr";

const FabricDyeingOrderTable = () => {
  const router = useRouter();
  const setLoading = useSetRecoilState(loadingState);
  const currentUser = useRecoilValue(currentUserState);
  const users = useRecoilValue(usersState);
  const [items, setItems] = useState({} as HistoryType);
  const { getSerialNumber, getUserName } = useGetDisp();
  const { isAdminAuth, isAuths } = useAuthManagement();
  const { getTodayDate } = useUtil();
  // const { data, mutate } = useSWR("/api/fabric-dyeing-orders");
  const fabricDyeingOrders = useRecoilValue(fabricDyeingOrdersState);
  const [filterfabricDyeingOrders, setFilterfabricDyeingOrders] =
    useState<any>();

  // 数量０のデータを非表示
  useEffect(() => {
    const newFabricDyeingOrders = fabricDyeingOrders.filter(
      (history: { quantity: number }) => history.quantity > 0 && history //後ほどフィルターを作る
    );
    setFilterfabricDyeingOrders(newFabricDyeingOrders);
  }, [fabricDyeingOrders]);

  // 生地仕掛状況　Orderを削除 type stock
  const deleteFabricDyeingOrderStock = async (history: any) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDoSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDoSnap.exists())
          throw "grayFabricDoSnap document does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        let stock = (await grayFabricDoSnap.data().stock) || 0;
        const newStock = stock + history.quantity;
        transaction.update(grayFabricDocRef, {
          stock: newStock,
        });

        let wip = (await productDocSnap.data().wip) || 0;
        const newWip = wip - history.quantity;
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.delete(historyDocRef);
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  // 生地仕掛状況　Orderを削除  type ranning
  const deleteFabricDyeingOrderRanning = async (history: HistoryType) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        let wip = (await productDocSnap.data().wip) || 0;
        const newWip = wip - history.quantity;
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.delete(historyDocRef);
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　生地仕掛状況　Order　編集（Stock在庫）
  const updateFabricDyeingOrderStock = async (history: HistoryType) => {
    setLoading(true);
    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabricDocSnap does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = (await grayFabricDocSnap.data().stock) || 0;
        const newStock = stock + history.quantity - items.quantity;
        transaction.update(grayFabricDocRef, {
          stock: newStock,
        });

        const wip = (await productDocSnap.data().wip) || 0;
        const newWip = wip - history.quantity + items.quantity;
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.update(historyDocRef, {
          quantity: items.quantity,
          price: items.price,
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  //　生地仕掛状況　Order　編集（ranning在庫）
  const updateFabricDyeingOrderRanning = async (history: HistoryType) => {
    setLoading(true);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const wip = (await productDocSnap.data().wip) || 0;
        const newWip = wip - history.quantity + items.quantity;
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.update(historyDocRef, {
          quantity: items.quantity,
          price: items.price,
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 生地染色　確定処理
  const confirmProcessingFabricDyeing = async (history: HistoryType) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;
    setLoading(true);

    const productDocRef = doc(db, "products", history.productId);
    const orderHistoryDocRef = doc(db, "fabricDyeingOrders", history.id);
    const confirmHistoryDocRef = doc(collection(db, "fabricDyeingConfirms"));

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        const newWip =
          (await productDocSnap.data()?.wip) -
            history.quantity +
            items.remainingOrder || 0;

        const newStock =
          (await productDocSnap.data()?.externalStock) + items.quantity || 0;
        transaction.update(productDocRef, {
          wip: newWip,
          externalStock: newStock,
        });

        transaction.update(orderHistoryDocRef, {
          quantity: items.remainingOrder,
          orderedAt: items.orderedAt || getTodayDate(),
          scheduledAt: items.scheduledAt || getTodayDate(),
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });

        transaction.set(confirmHistoryDocRef, {
          serialNumber: history.serialNumber,
          orderType: history.orderType,
          grayFabricId: history.grayFabricId,
          productId: history.productId,
          productNumber: history.productNumber,
          productName: history.productName,
          colorName: history.colorName,
          supplierId: history.supplierId,
          supplierName: history.supplierName,
          price: history.price,
          quantity: items.quantity,
          comment: items.comment,
          orderedAt: items.orderedAt || history.orderedAt,
          fixedAt: items.fixedAt || getTodayDate(),
          createUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      router.push("/products/fabric-dyeing/confirms");
    }
  };

  const elementComment = (history: HistoryType, collectionName: string) => (
    <Flex gap={3}>
      <CommentModal
        id={history.id}
        comment={history.comment}
        collectionName={collectionName}
      />
      {history?.comment.slice(0, 20) +
        (history.comment.length >= 1 ? "..." : "")}
    </Flex>
  );

  const elmentEditDelete = (
    history: HistoryType,
    onClickUpdate: Function,
    onClickDelete: Function
  ) => (
    <Flex gap={3}>
      <HistoryEditModal
        history={history}
        type="order"
        onClick={() => onClickUpdate(history)}
        items={items}
        setItems={setItems}
        orderType="dyeing"
      />
      {isAdminAuth() && (
        <FaTrashAlt
          color="#444"
          cursor="pointer"
          onClick={() => onClickDelete(history)}
        />
      )}
    </Flex>
  );

  return (
    <>
      <TableContainer p={6} pt={0} w="100%">
        {filterfabricDyeingOrders?.length > 0 ? (
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>確定</Th>
                <Th>発注NO.</Th>
                <Th>発注日</Th>
                <Th>仕上予定日</Th>
                <Th>担当者</Th>
                <Th>品番</Th>
                <Th>色</Th>
                <Th>品名</Th>
                <Th>数量</Th>
                <Th>単価</Th>
                <Th>金額</Th>
                <Th>コメント</Th>
                <Th>編集/削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterfabricDyeingOrders?.map((history: HistoryType) => (
                <Tr key={history.id}>
                  <Td>
                    {isAuths(["rd"]) || history.createUser === currentUser ? (
                      <OrderToConfirmModal
                        history={history}
                        items={items}
                        setItems={setItems}
                        onClick={() => confirmProcessingFabricDyeing(history)}
                      />
                    ) : (
                      <Button size="xs" disabled={true}>
                        確定
                      </Button>
                    )}
                  </Td>
                  <Td>{getSerialNumber(history?.serialNumber)}</Td>
                  <Td>{history?.orderedAt}</Td>
                  <Td>{history?.scheduledAt}</Td>
                  <Td>{getUserName(history.createUser)}</Td>
                  <Td>{history.productNumber}</Td>
                  {history.colorName && <Td>{history.colorName}</Td>}
                  <Td>{history.productName}</Td>
                  <Td>{history?.quantity.toLocaleString()}m</Td>
                  {history.price && (
                    <>
                      <Td>{history?.price.toLocaleString()}円</Td>
                      <Td>
                        {(history?.quantity * history?.price).toLocaleString()}
                        円
                      </Td>
                    </>
                  )}
                  <Td w="100%" textAlign="center">
                    {elementComment(history, "historyFabricDyeingOrders")}
                  </Td>
                  <Td>
                    <Flex gap={3}>
                      {(isAuths(["rd"]) ||
                        history?.createUser === currentUser) &&
                        history.orderType === "dyeing" && (
                          <>
                            {history.stockType === "stock" &&
                              elmentEditDelete(
                                history,
                                updateFabricDyeingOrderStock,
                                deleteFabricDyeingOrderStock
                              )}
                            {history.stockType === "ranning" &&
                              elmentEditDelete(
                                history,
                                updateFabricDyeingOrderRanning,
                                deleteFabricDyeingOrderRanning
                              )}
                          </>
                        )}
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Box textAlign="center">現在登録された情報はありません。</Box>
        )}
      </TableContainer>
    </>
  );
};

export default FabricDyeingOrderTable;
