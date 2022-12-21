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
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { getSerialNumber } from "../../../functions";
import { usersState } from "../../../store";
import ConfirmModal from "./ConfirmModal";
import { EditHistoryModal } from "./EditHistoryModal";
import HistoryConfirmModal from "./HistoryConfirmModal";
import FabricDyeingConfirmModal from "./HistoryConfirmModal";
// import EditWipGrayFAbricModal from "./EditWipGrayFabricModal";

type Props = {
  historys: any;
  title: string;
};

const OrderHistoryTable: NextPage<Props> = ({ historys, title }) => {
  const [filterHistorys, setFilterHistorys] = useState<any>();
  const users = useRecoilValue(usersState);

  useEffect(() => {
    const newHistorys = historys?.filter(
      (history: { quantity: number }) => history.quantity > 0
    );
    setFilterHistorys(newHistorys);
  }, [historys]);

  // 担当者の表示
  const getCreateUserName = (userId: string) => {
    if (userId === "R&D") {
      return "R&D";
    } else {
      const user = users.find((user: { uid: string }) => userId === user.uid);
      return user?.name;
    }
  };

  // status 表示
  const statusDisp = (num: number) => {
    switch (num) {
      case 1:
        return "仕掛中";
      case 2:
        return "仕上済み";
      default:
        break;
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

  // 生機履歴を削除
  const deleteHistoryGrayFabric = async (history: any) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 履歴のデータベースを取得
        const historyDocRef = doc(db, "historyGrayFabrics", `${history.id}`);
        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) {
          throw "history document does not exist!";
        }

        // 生地のデータベースを取得
        const productDocRef = doc(db, "products", `${history.productId}`);
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) {
          throw "product document does not exist!";
        }

        //　生機仕掛
        let wipGrayFabricQuantity =
          productDocSnap.data().wipGrayFabricQuantity || 0;

        //　生機在庫
        let stockGrayFabricQuantity =
          productDocSnap.data().stockGrayFabricQuantity || 0;

        // 履歴データを削除
        transaction.delete(historyDocRef);
        // 生機数量を更新
        transaction.update(productDocRef, {
          wipGrayFabricQuantity,
          stockGrayFabricQuantity,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  // 生機履歴を削除
  const cancelHistoryGrayFabric = async (history: any) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 履歴のデータベースを取得
        const historyDocRef = doc(db, "historyGrayFabrics", `${history.id}`);
        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) {
          throw "history document does not exist!";
        }

        // 生地のデータベースを取得
        const productDocRef = doc(db, "products", `${history.productId}`);
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) {
          throw "product document does not exist!";
        }

        //　生機仕掛
        let wipGrayFabricQuantity =
          productDocSnap.data().wipGrayFabricQuantity || 0;

        //　生機在庫
        let stockGrayFabricQuantity =
          productDocSnap.data().stockGrayFabricQuantity || 0;

        // 履歴データを削除
        transaction.delete(historyDocRef);
        // 生機数量を更新
        transaction.update(productDocRef, {
          wipGrayFabricQuantity,
          stockGrayFabricQuantity,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  // 染色履歴を削除
  const deleteHistoryFabricDyeing = async (history: any) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 履歴のデータベースを取得
        const historyDocRef = doc(db, "historyFabricDyeings", `${history.id}`);
        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) {
          throw "history document does not exist!";
        }

        // 生地のデータベースを取得
        const productDocRef = doc(db, "products", `${history.productId}`);
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) {
          throw "product document does not exist!";
        }

        //　生機在庫
        let stockGrayFabricQuantity =
          productDocSnap.data().stockGrayFabricQuantity || 0;

        //　生地仕掛
        let wipFabricDyeingQuantity =
          productDocSnap.data().wipFabricDyeingQuantity || 0;

        //  生地在庫
        let stockFabricDyeingQuantity =
          productDocSnap.data().stockFabricDyeingQuantity || 0;

        // 履歴データを削除
        transaction.delete(historyDocRef);
        // 染色数量を更新
        transaction.update(productDocRef, {
          stockGrayFabricQuantity,
          wipFabricDyeingQuantity,
          stockFabricDyeingQuantity,
        });
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
      {filterHistorys?.length > 0 ? (
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
            {filterHistorys?.map((history: any) => (
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
                  {history?.comment}
                </Td>
                <Td>
                  <Flex gap={3}>
                    <EditHistoryModal history={history} />
                    <FaTrashAlt
                      cursor="pointer"
                      onClick={() => deleteHistoryGrayFabric(history)}
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

export default OrderHistoryTable;
