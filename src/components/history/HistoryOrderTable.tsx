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
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { getSerialNumber } from "../../../functions";
import { usersState } from "../../../store";

import { HistoryEditModal } from "./HistoryEditModal";
import HistoryConfirmModal from "./HistoryConfirmModal";
import CommentModal from "./CommentModal";

type Props = {
  histories: any;
  title: string;
};

const HistoryOrderTable: NextPage<Props> = ({ histories, title }) => {
  const [filterHistories, setFilterHistories] = useState<any>();
  const users = useRecoilValue(usersState);

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
  const deleteFabricDyeingOrderRanning = async (history: any) => {
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
              <Th>生地品番</Th>
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
            {filterHistories?.map((history: any) => (
              <Tr key={history.id}>
                <Td>
                  <HistoryConfirmModal history={history} />
                </Td>
                <Td>{getSerialNumber(history?.serialNumber)}</Td>
                <Td>{history?.orderedAt}</Td>
                <Td>{history?.scheduledAt}</Td>
                <Td>{getCreateUserName(history.createUser)}</Td>
                <Td>{history.productNumber}</Td>
                <Td>{history.colorName}</Td>
                <Td>{history.productName}</Td>
                <Td>{history?.quantity}m</Td>
                <Td>{history?.price}円</Td>
                <Td>{history?.quantity * history?.price}円</Td>
                <Td w="100%" textAlign="center">
                  <Flex gap={3}>
                    <CommentModal
                      history={history}
                      collectionName="historyFabricDyeingOrders"
                    />
                    {history?.comment.slice(0, 20) +
                      (history.comment.length >= 1 ? "..." : "")}
                  </Flex>
                </Td>
                <Td>
                  <Flex gap={3}>
                    <HistoryEditModal history={history} type="order" />
                    <FaTrashAlt
                      cursor="pointer"
                      onClick={() => {
                        history.stockType === "stock" &&
                          deleteFabricDyeingOrderStock(history);
                        history.stockType === "ranning" &&
                          deleteFabricDyeingOrderRanning(history);
                      }}
                    />
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
