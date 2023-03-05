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
import { currentUserState, loadingState, usersState } from "../../../../store";
import CommentModal from "../../CommentModal";
import { HistoryType } from "../../../../types/HistoryType";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { useAuthManagement } from "../../../hooks/UseAuthManagement";
import { useUtil } from "../../../hooks/UseUtil";
import { HistoryEditModal } from "../../history/HistoryEditModal";
import OrderToConfirmModal from "../../history/OrderToConfirmModal";
import { useAPI } from "../../../hooks/UseAPI";
import { useRouter } from "next/router";

const FabricPurchaseOrderTable = () => {
  const HOUSE_FACTORY = "徳島工場";
  const router = useRouter();
  const setLoading = useSetRecoilState(loadingState);
  const [filterHistories, setFilterHistories] = useState<any>();
  const currentUser = useRecoilValue(currentUserState);
  const users = useRecoilValue(usersState);
  const [items, setItems] = useState({} as HistoryType);
  const { getSerialNumber, getUserName } = useGetDisp();
  const { isAdminAuth } = useAuthManagement();
  const { getTodayDate, mathRound2nd } = useUtil();
  const { data, mutate } = useAPI("/api/fabric-purchase-orders");
  mutate("/api/fabric-purchase-orders");

  // 数量０のデータを非表示
  useEffect(() => {
    const newHistorys = data?.contents?.filter(
      (history: { quantity: number; }) => history.quantity //後ほどフィルターを作る
    );
    setFilterHistories(newHistorys);
  }, [data]);


  // 購入状況　orderを削除（stock ranning共通）
  const deleteHistoryFabricPurchaseOrder = async (history: any) => {
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
  const updateHistoryFabricPurchaseOrder = async (history: HistoryType) => {
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
      router.push("/products/fabric-purchase/orders");
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
        if (items.stockPlace === HOUSE_FACTORY) {
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
      router;
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
        mutate={mutate}
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
      {filterHistories?.length > 0 ? (
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
            {filterHistories?.map((history: HistoryType) => (
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
                <Td>{history?.quantity}m</Td>
                {history.price && (
                  <>
                    <Td>{history?.price}円</Td>
                    <Td>{history?.quantity * history?.price}円</Td>
                  </>
                )}
                <Td>{history?.stockPlace}</Td>
                <Td w="100%" textAlign="center">
                  {elementComment(history, "historyFabricDyeingOrders")}
                </Td>
                <Td>
                  <Flex gap={3}>
                    {history.orderType === "purchase" &&
                      elmentEditDelete(
                        history,
                        updateHistoryFabricPurchaseOrder,
                        deleteHistoryFabricPurchaseOrder
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
