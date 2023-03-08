import {
  Box,
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
import { db } from "../../../../firebase";
import {
  currentUserState,
  fabricPurchaseOrdersState,
  loadingState,
  usersState,
} from "../../../../store";
import CommentModal from "../../CommentModal";
import { HistoryType } from "../../../../types/HistoryType";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { useAuthManagement } from "../../../hooks/UseAuthManagement";
import { useUtil } from "../../../hooks/UseUtil";
import { HistoryEditModal } from "../../history/HistoryEditModal";
import OrderToConfirmModal from "../../history/OrderToConfirmModal";
import { useRouter } from "next/router";
import useSWR from "swr";
import { NextPage } from "next";

type Props = {
  HOUSE_FACTORY?: string;
};

const FabricPurchaseOrderTable: NextPage<Props> = ({ HOUSE_FACTORY }) => {
  const router = useRouter();
  const setLoading = useSetRecoilState(loadingState);
  const currentUser = useRecoilValue(currentUserState);
  const users = useRecoilValue(usersState);
  const [items, setItems] = useState({} as HistoryType);
  const { getSerialNumber, getUserName } = useGetDisp();
  const { isAdminAuth } = useAuthManagement();
  const { getTodayDate, mathRound2nd } = useUtil();
  const { data, mutate } = useSWR("/api/fabric-purchase-orders");
  const fabricPurchaseOrders = useRecoilValue(fabricPurchaseOrdersState);
  const [filterFabricPurchaseOrders, setFilterFabricPurchaseOrders] = useState(
    [] as HistoryType[]
  );
  const STOCK_PLACE = "徳島工場";

  // 数量０のデータを非表示
  useEffect(() => {
    if (HOUSE_FACTORY) {
      const newHistorys = fabricPurchaseOrders?.filter(
        (history: HistoryType) =>
          history.stockPlace === HOUSE_FACTORY && history
      );
      setFilterFabricPurchaseOrders(newHistorys);
    } else {
      const newHistorys = fabricPurchaseOrders?.filter(
        (history: HistoryType) => history
      );
      setFilterFabricPurchaseOrders(
        newHistorys.sort(
          (a: { serialNumber: number }, b: { serialNumber: number }) =>
            a.serialNumber > b.serialNumber && -1
        )
      );
    }
  }, [fabricPurchaseOrders, HOUSE_FACTORY]);

  // 購入状況　orderを削除（stock ranning共通）
  const deleteFabricPurchaseOrder = async (history: any) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricPurchaseOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockType === "stock") {
          const externalStock =
            (await productDocSnap.data().externalStock) || 0;
          const newExternalStock = externalStock + history.quantity;
          const arrivingQuantity =
            (await productDocSnap.data().arrivingQuantity) || 0;
          const newArrivingQuantity = arrivingQuantity - history.quantity;
          transaction.update(productDocRef, {
            externalStock: newExternalStock,
            arrivingQuantity: newArrivingQuantity,
          });
        }
        if (history.stockType === "ranning") {
          const arrivingQuantity =
            (await productDocSnap.data().arrivingQuantity) || 0;
          const newArrivingQuantity = arrivingQuantity - history.quantity;
          transaction.update(productDocRef, {
            arrivingQuantity: newArrivingQuantity,
          });
        }

        transaction.delete(historyDocRef);
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　購入状況　orderを編集（stock ranning共通）
  const updateFabricPurchaseOrder = async (history: HistoryType) => {
    setLoading(true);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricPurchaseOrders", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockType === "stock") {
          const externalStock =
            (await productDocSnap.data().externalStock) || 0;
          const newExternalStock =
            externalStock + history.quantity - items.quantity;

          const arrivingQuantity =
            (await productDocSnap.data().arrivingQuantity) || 0;
          const newArrivingQuantity =
            arrivingQuantity - history.quantity + items.quantity;

          transaction.update(productDocRef, {
            externalStock: mathRound2nd(newExternalStock),
            arrivingQuantity: mathRound2nd(newArrivingQuantity),
          });
        }
        if (history.stockType === "ranning") {
          const arrivingQuantity =
            (await productDocSnap.data().arrivingQuantity) || 0;
          const newArrivingQuantity =
            arrivingQuantity - history.quantity + items.quantity;

          transaction.update(productDocRef, {
            arrivingQuantity: mathRound2nd(newArrivingQuantity),
          });
        }

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

  // 購入状況　確定処理
  const confirmProcessingFabricPurchase = async (history: HistoryType) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const orderHistoryDocRef = doc(db, "fabricPurchaseOrders", history.id);
    const confirmHistoryDocRef = doc(collection(db, "fabricPurchaseConfirms"));

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        const newArrivingQuantity =
          (await productDocSnap.data()?.arrivingQuantity) -
            history.quantity +
            items.remainingOrder || 0;

        let newTokushimaStock = 0;
        if (items.stockPlace === STOCK_PLACE) {
          newTokushimaStock =
            (await productDocSnap.data()?.tokushimaStock) + items.quantity || 0;
        }

        transaction.update(productDocRef, {
          arrivingQuantity: mathRound2nd(newArrivingQuantity),
          tokushimaStock: mathRound2nd(newTokushimaStock),
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
          stockPlace: items.stockPlace,
          comment: items.comment,
          orderedAt: items.orderedAt || history.orderedAt,
          fixedAt: items.fixedAt || getTodayDate(),
          createUser: currentUser,
          updateUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      router.push("/products/fabric-purchase/confirms");
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
    <TableContainer p={6} w="100%">
      <Box as="h2" fontSize="2xl">
        入荷予定一覧
      </Box>
      {filterFabricPurchaseOrders?.length > 0 ? (
        <Table mt={6} variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>確定</Th>
              <Th>発注NO.</Th>
              <Th>発注日</Th>
              <Th>入荷予定</Th>
              <Th>担当者</Th>
              <Th>品番</Th>
              <Th>色</Th>
              <Th>品名</Th>
              <Th>数量</Th>
              <Th>単価</Th>
              <Th>金額</Th>
              <Th>出荷先</Th>
              <Th>コメント</Th>
              <Th>編集/削除</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filterFabricPurchaseOrders?.map((history: HistoryType) => (
              <Tr key={history.id}>
                <Td>
                  <OrderToConfirmModal
                    history={history}
                    items={items}
                    setItems={setItems}
                    onClick={() => confirmProcessingFabricPurchase(history)}
                  />
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
                      {(history?.quantity * history?.price).toLocaleString()}円
                    </Td>
                  </>
                )}
                <Td>{history?.stockPlace}</Td>
                <Td w="100%" textAlign="center">
                  {elementComment(history, "fabricDyeingOrders")}
                </Td>
                <Td>
                  <Flex gap={3}>
                    {history.orderType === "purchase" &&
                      elmentEditDelete(
                        history,
                        updateFabricPurchaseOrder,
                        deleteFabricPurchaseOrder
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
  );
};

export default FabricPurchaseOrderTable;
