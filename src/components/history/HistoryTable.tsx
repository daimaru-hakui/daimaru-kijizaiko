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
import { db } from "../../../firebase";
import ConfirmModal from "./ConfirmModal";
import EditWipGrayFAbricModal from "./EditWipGrayFabricModal";

type Props = {
  historys: any;
  title: string;
  status: number;
  orderType: number;
};

const HistoryGrayFabricTable: NextPage<Props> = ({
  historys,
  title,
  status,
  orderType,
}) => {
  const [filterHistorys, setFilterHistorys] = useState<any>();
  useEffect(() => {
    const newHistorys = historys?.filter(
      (history: { status: number }) => history.status === status
    );
    setFilterHistorys(newHistorys);
  }, [historys, status]);

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
          throw "history document does not exist!";
        }

        let oldQuantity = 0;
        let prop = "";
        switch (status) {
          // 仕掛中から削除
          case 0:
            oldQuantity = productDocSnap.data().wipGrayFabricQuantity || 0;
            prop = "wipGrayFabricQuantity";
            break;
          // 在庫から削除
          case 1:
            oldQuantity = productDocSnap.data().stockGrayFabricQuantity || 0;
            if (oldQuantity < history.quantity) {
              window.alert("削除する数量が生機在庫を上回っています。");
              throw "削除する数量が生機在庫を上回っています。";
            }
            prop = "stockGrayFabricQuantity";
            break;
        }

        // 新しい数量
        const newQuantity = oldQuantity - Math.abs(history.quantity);

        // 履歴データを削除
        transaction.delete(historyDocRef);
        // 生機数量を更新
        transaction.update(productDocRef, {
          [prop]: newQuantity,
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

        let oldQuantity = 0;
        let prop = "";
        switch (status) {
          // 仕掛中から削除
          case 0:
            oldQuantity = productDocSnap.data().wipFabricDyeingQuantity || 0;
            prop = "wipFabricDyeingQuantity";
            break;
          // 在庫から削除
          case 1:
            oldQuantity = productDocSnap.data().stockFabricDyeingQuantity || 0;
            if (oldQuantity < history.quantity) {
              window.alert("削除する数量が生機在庫を上回っています。");
              throw "削除する数量が生機在庫を上回っています。";
            }
            prop = "stockFabricDyeingQuantity";
            break;
        }

        //　生機が在庫分かランニング在庫かで戻し在庫を振り分ける
        let stockGrayFabricQuantity = 0;
        if (history.stockPlaceType === 1) {
          stockGrayFabricQuantity =
            productDocSnap.data().stockGrayFabricQuantity + history.quantity;
        } else {
          stockGrayFabricQuantity =
            productDocSnap.data().stockGrayFabricQuantity;
        }

        // 新しい数量
        const newQuantity = oldQuantity - Math.abs(history.quantity);

        // 履歴データを削除
        transaction.delete(historyDocRef);
        // 染色数量を更新
        transaction.update(productDocRef, {
          [prop]: newQuantity,
          stockGrayFabricQuantity,
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
      <Table mt={6} variant="simple" size="sm">
        <Thead>
          <Tr>
            {status === 0 && <Th></Th>}
            <Th>発注日</Th>
            {status === 0 ? <Th>仕上予定日</Th> : <Th>仕上日</Th>}
            <Th>生地品番</Th>
            <Th>色</Th>
            <Th>品名</Th>
            <Th>数量</Th>
            <Th>単価</Th>
            <Th>金額</Th>
            <Th>コメント</Th>
            <Th>処理</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filterHistorys?.map((history: any) => (
            <Tr key={history.id}>
              {status === 0 && (
                <Td>
                  <ConfirmModal history={history} />
                </Td>
              )}
              <Td>{history?.orderedAt}</Td>
              <Td>
                {status === 0 ? history?.scheduledAt : history?.finishedAt}
              </Td>
              <Td>{history.productNumber}</Td>
              <Td>{history.colorName}</Td>
              <Td>{history.productName}</Td>
              <Td>{history?.quantity}m</Td>
              <Td>{history?.price}円</Td>
              <Td>{history?.quantity * history?.price}円</Td>
              <Td>{history?.comment}</Td>

              <Td>
                <Flex gap={3}>
                  {orderType === 1 && (
                    <>
                      <EditWipGrayFAbricModal history={history} />
                      <FaTrashAlt
                        cursor="pointer"
                        onClick={() => deleteHistoryGrayFabric(history)}
                      />
                    </>
                  )}
                  {orderType === 2 && (
                    <FaTrashAlt
                      cursor="pointer"
                      onClick={() => deleteHistoryFabricDyeing(history)}
                    />
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default HistoryGrayFabricTable;
