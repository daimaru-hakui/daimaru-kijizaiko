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
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { getSerialNumber, todayDate } from "../../../functions";
import { currentUserState, usersState } from "../../../store";

import { HistoryEditModal } from "./HistoryEditModal";
import HistoryOrderToConfirmModal from "./HistoryOrderToConfirmModal";
import CommentModal from "./CommentModal";
import { HistoryType } from "../../../types/HistoryType";

type Props = {
  histories: HistoryType[];
  title: string;
};

const HistoryOrderTable: NextPage<Props> = ({ histories, title }) => {
  const [filterHistories, setFilterHistories] = useState<any>();
  const currentUser = useRecoilValue(currentUserState);
  const users = useRecoilValue(usersState);
  const [items, setItems] = useState({} as HistoryType);

  useEffect(() => {
    const newHistorys = histories?.filter(
      (history: { quantity: number }) => history.quantity > 0
    );
    setFilterHistories(newHistorys);
  }, [histories]);

  // 担当者の表示
  const getCreateUserName = (userId: string) => {
    if (userId === "R&D") {
      return "R&D";
    } else {
      const user = users.find((user: { uid: string }) => userId === user.uid);
      return user?.name;
    }
  };

  // 日付を取得
  const convertTimestampToDate = (timestamp: Date) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    let month = String(date.getMonth() + 1);
    month = ("0" + month).slice(-2);
    let day = String(date.getDate());
    day = ("0" + day).slice(-2);
    let hour = String(date.getHours());
    hour = ("0" + hour).slice(-2);
    let minutes = String(date.getMinutes());
    minutes = ("0" + minutes).slice(-2);
    return `${year}-${month}-${day}-${hour}-${minutes}`;
  };

  // 染色Orderを削除 type stock
  const deleteFabricDyeingOrderStock = async (history: any) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDoSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDoSnap.exists())
          throw "grayFabricDoSnap document does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        let stock = grayFabricDoSnap.data().stock || 0;
        const newStock = stock + history.quantity;
        transaction.update(grayFabricDocRef, {
          stock: newStock,
        });

        let wip = productDocSnap.data().wip || 0;
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
  // 染色Orderを削除 type ranning
  const deleteFabricDyeingOrderRanning = async (history: HistoryType) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        let wip = productDocSnap.data().wip || 0;
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

  const updateHistoryFabricDyeingOrderStock = async (history: HistoryType) => {
    const grayFabricRef = doc(db, "grayFabrics", history.grayFabricId);
    const productRef = doc(db, "products", history.productId);
    const historyRef = doc(db, "historyFabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabricDocSnap does not exist!";

        const productDocSnap = await transaction.get(productRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = grayFabricDocSnap.data().stock || 0;
        const newStock = stock + history.quantity - items.quantity;
        transaction.update(grayFabricRef, {
          stock: newStock,
        });

        const wip = productDocSnap.data().wip || 0;
        const newWip = wip - history.quantity + items.quantity;
        transaction.update(productRef, {
          wip: newWip,
        });

        transaction.update(historyRef, {
          quantity: items.quantity,
          price: items.price,
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　生地オーダー編集（ランニング在庫）
  const updateHistoryFabricDyeingOrderRanning = async (
    history: HistoryType
  ) => {
    const productRef = doc(db, "products", history.productId);
    const historyRef = doc(db, "historyFabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const wip = productDocSnap.data().wip || 0;
        const newWip = wip - history.quantity + items.quantity;
        transaction.update(productRef, {
          wip: newWip,
        });

        transaction.update(historyRef, {
          quantity: items.quantity,
          price: items.price,
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const confirmProcessingFabricDyeing = async (history: HistoryType) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const orderHistoryRef = doc(db, "historyFabricDyeingOrders", history.id);
    const confirmHistoryRef = collection(db, "historyFabricDyeingConfirms");

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        const newWip =
          productDocSnap.data()?.wip -
            history.quantity +
            items.remainingOrder || 0;
        const newStock =
          productDocSnap.data()?.externalStock + items.quantity || 0;
        transaction.update(productDocRef, {
          wip: newWip,
          externalStock: newStock,
        });

        transaction.update(orderHistoryRef, {
          quantity: items.remainingOrder,
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt || todayDate(),
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });

        await addDoc(confirmHistoryRef, {
          serialNumber: history.serialNumber,
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
          fixedAt: items.fixedAt || todayDate(),
          createUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  return (
    <TableContainer p={6} w="100%">
      <Box as="h2" fontSize="2xl">
        {title}
      </Box>
      {filterHistories?.length > 0 ? (
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
            {filterHistories?.map((history: HistoryType) => (
              <Tr key={history.id}>
                <Td>
                  <HistoryOrderToConfirmModal
                    history={history}
                    items={items}
                    setItems={setItems}
                    onClick={confirmProcessingFabricDyeing}
                  />
                </Td>
                <Td>{getSerialNumber(history?.serialNumber)}</Td>
                <Td>{history?.orderedAt}</Td>
                <Td>{history?.scheduledAt}</Td>
                <Td>{getCreateUserName(history.createUser)}</Td>
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
                <Td w="100%" textAlign="center">
                  <Flex gap={3}>
                    <CommentModal
                      id={history.id}
                      comment={history.comment}
                      collectionName="historyFabricDyeingOrders"
                    />
                    {history?.comment.slice(0, 20) +
                      (history.comment.length >= 1 ? "..." : "")}
                  </Flex>
                </Td>
                <Td>
                  <Flex gap={3}>
                    {history.stockType === "stock" && (
                      <>
                        <HistoryEditModal
                          history={history}
                          type="order"
                          items={items}
                          setItems={setItems}
                          onClick={updateHistoryFabricDyeingOrderStock}
                        />
                        <FaTrashAlt
                          cursor="pointer"
                          onClick={() => deleteFabricDyeingOrderStock(history)}
                        />
                      </>
                    )}
                    {history.stockType === "ranning" && (
                      <>
                        <HistoryEditModal
                          history={history}
                          type="order"
                          items={items}
                          setItems={setItems}
                          onClick={updateHistoryFabricDyeingOrderRanning}
                        />
                        <FaTrashAlt
                          cursor="pointer"
                          onClick={() =>
                            deleteFabricDyeingOrderRanning(history)
                          }
                        />
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
  );
};

export default HistoryOrderTable;
