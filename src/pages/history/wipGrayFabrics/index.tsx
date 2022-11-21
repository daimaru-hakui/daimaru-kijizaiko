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
import { db } from "../../../../firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import EditWipGrayFAbricModal from "../../../components/history/EditWipGrayFAbricModal";

const HistoryWipGrayFabrics = () => {
  const [historys, setHistorys] = useState<any>();

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

  // status 表示
  const statusDisp = (num: number) => {
    switch (num) {
      case 0:
        return "仕掛中";
      case 1:
        return "仕上済み";
      default:
        break;
    }
  };

  useEffect(() => {
    const getHistoryWipGrayFabrics = async () => {
      const q = query(
        collection(db, "historyWipGrayFabrics"),
        orderBy("createdAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistorys(
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getHistoryWipGrayFabrics();
  }, []);

  // 履歴を削除
  const deleteHistory = async (history: any) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 履歴のデータベースを取得
        const historyDocRef = doc(db, "historyWipGrayFabrics", `${history.id}`);
        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) {
          throw "history document does not exist!";
        }

        // 生地のデータベースを取得
        const productDocRef = doc(db, "products", `${history.productId}`);
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) {
          throw "history document does not exist!";
        }
        // 新しい数量
        const oldQuantity = productDocSnap.data().wipGrayFabricQuantity;
        const newQuantity = oldQuantity - Math.abs(history.quantity);

        //　履歴データを削除
        transaction.delete(historyDocRef);
        // 生地情報の生機仕掛数量を更新
        transaction.update(productDocRef, {
          wipGrayFabricQuantity: newQuantity,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} rounded="md" bg="white" boxShadow="md">
        <TableContainer p={6} w="100%">
          <Box as="h2" fontSize="2xl">
            生機仕掛履歴
          </Box>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>日付</Th>
                <Th>状態</Th>
                <Th>生地品番</Th>
                <Th>色</Th>
                <Th>品名</Th>
                <Th>単価</Th>
                <Th>数量</Th>
                <Th>コメント</Th>
                <Th>削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {historys?.map((history: any) => (
                <Tr key={history.id}>
                  <Td>{convertTimestampToDate(history?.createdAt.toDate())}</Td>
                  <Td>{statusDisp(history?.status)}</Td>
                  <Td>{history.productNumber}</Td>
                  <Td>{history.colorName}</Td>
                  <Td>{history.productName}</Td>
                  <Td>{history?.price}円</Td>
                  <Td>{history?.quantity}m</Td>
                  <Td>{history?.comment}</Td>

                  <Td>
                    <Flex gap={3}>
                      <EditWipGrayFAbricModal history={history} />
                      <FaTrashAlt
                        cursor="pointer"
                        onClick={() => deleteHistory(history)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default HistoryWipGrayFabrics;
