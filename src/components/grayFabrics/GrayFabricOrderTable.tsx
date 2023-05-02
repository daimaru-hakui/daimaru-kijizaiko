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
  deleteDoc,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState, FC } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { db } from "../../../firebase";
import { useAuthStore, useGrayFabricStore } from "../../../store";
import { GrayFabricHistory, History } from "../../../types";
import { OrderToConfirmModal } from "../history/OrderToConfirmModal";
import { CommentModal } from "../CommentModal";
import { HistoryEditModal } from "../history/HistoryEditModal";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import { useAuthManagement } from "../../hooks/UseAuthManagement";

export const GrayFabricOrderTable: FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [items, setItems] = useState<History>();
  const { isAuths } = useAuthManagement();
  const { getSerialNumber, getUserName } = useGetDisp();
  const { getTodayDate } = useUtil();
  const grayFabricOrders = useGrayFabricStore((state) => state.grayFabricOrders);
  const [filterGrayFabrics, setFilterGrayFabrics] = useState<GrayFabricHistory[]>([]);

  useEffect(() => {
    const newGrayFabrics = grayFabricOrders.filter(
      (grayFabric) => grayFabric.quantity > 0 && grayFabric
    );
    setFilterGrayFabrics(newGrayFabrics);
  }, [grayFabricOrders]);

  // キバタ仕掛から削除
  const deleteGrayFabricOrder = async (history: GrayFabricHistory) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const orderHistoryRef = doc(db, "grayFabricOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "Document does not exist!!";

        const newWip =
          (await grayFabricDocSnap.data()?.wip) - Number(history.quantity);
        transaction.update(grayFabricDocRef, {
          wip: newWip,
        });

        await deleteDoc(orderHistoryRef);
      });
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  const updateOrderHistory = async (history: GrayFabricHistory) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const historyDocRef = doc(db, "grayFabricOrders", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "Document does not exist!!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "Document does not exist!!";

        const newWip =
          (await grayFabricDocSnap.data()?.wip) -
          history.quantity +
          Number(items.quantity) || 0;
        transaction.update(grayFabricDocRef, {
          wip: newWip,
        });

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
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
    }
  };

  // 確定処理　キバタ仕掛⇒キバタ在庫
  const confirmProcessing = async (history: GrayFabricHistory) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history?.grayFabricId);
    const orderHistoryRef = doc(db, "grayFabricOrders", history.id);
    const confirmHistoryDocRef = doc(collection(db, "grayFabricConfirms"));

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "Document does not exist!!";

        const newWip =
          grayFabricDocSnap.data()?.wip -
          Number(history.quantity) +
          Number(items.remainingOrder) || 0;
        const newStock =
          grayFabricDocSnap.data()?.stock + Number(items.quantity) || 0;
        transaction.update(grayFabricDocRef, {
          wip: newWip,
          stock: newStock,
        });

        transaction.update(orderHistoryRef, {
          quantity: items.remainingOrder,
          orderedAt: items.orderedAt || getTodayDate(),
          scheduledAt: items.scheduledAt || getTodayDate(),
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });

        transaction.set(confirmHistoryDocRef, {
          serialNumber: history.serialNumber,
          grayFabricId: history.grayFabricId,
          orderedAt: items.orderedAt || history.orderedAt,
          fixedAt: items.fixedAt || getTodayDate(),
          createUser: currentUser,
          productNumber: history.productNumber,
          productName: history.productName,
          supplierId: history.supplierId,
          supplierName: history.supplierName,
          quantity: items.quantity,
          comment: items.comment,
          createdAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
    }
  };
  return (
    <>
      <TableContainer p={6} pt={0} w="100%">
        {filterGrayFabrics?.length > 0 ? (
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>処理</Th>
                <Th>発注NO.</Th>
                <Th>発注日</Th>
                <Th>予定納期</Th>
                <Th>担当者</Th>
                <Th>品番</Th>
                <Th>品名</Th>
                <Th>仕入先</Th>
                <Th>数量</Th>
                <Th>コメント</Th>
                <Th>編集/削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterGrayFabrics.map((history) => (
                <Tr key={history.id}>
                  <Td>
                    {isAuths(["rd"]) || history.createUser === currentUser ? (
                      <OrderToConfirmModal
                        history={history}
                        items={items}
                        setItems={setItems}
                        onClick={confirmProcessing}
                      />
                    ) : (
                      <Button size="xs" disabled={true}>
                        確定
                      </Button>
                    )}
                  </Td>
                  <Td>{getSerialNumber(history.serialNumber)}</Td>
                  <Td>{history.orderedAt}</Td>
                  <Td>{history.scheduledAt}</Td>
                  <Td>{getUserName(history.createUser)}</Td>
                  <Td>{history.productNumber}</Td>
                  <Td>{history.productName}</Td>
                  <Td>{history.supplierName}</Td>
                  <Td isNumeric>{history?.quantity}m</Td>
                  <Td w="100%">
                    <Flex gap={3}>
                      <CommentModal
                        id={history.id}
                        comment={history.comment}
                        collectionName="historyGrayFabricOrders"
                      />
                      {history?.comment.slice(0, 20) +
                        (history.comment.length >= 1 ? "..." : "")}
                    </Flex>
                  </Td>
                  <Td>
                    {isAuths(["rd"]) ||
                      (history.createUser === currentUser && (
                        <Flex alignItems="center" gap={3}>
                          <HistoryEditModal
                            history={history}
                            type="order"
                            items={items}
                            setItems={setItems}
                            onClick={updateOrderHistory}
                            orderType=""
                          />
                          <FaTrashAlt
                            color="#444"
                            cursor="pointer"
                            onClick={() => deleteGrayFabricOrder(history)}
                          />
                        </Flex>
                      ))}
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
