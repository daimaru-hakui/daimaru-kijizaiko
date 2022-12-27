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
import { doc, runTransaction } from "firebase/firestore";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { getSerialNumber } from "../../../functions";
import { currentUserState, usersState } from "../../../store";
import { HistoryEditModal } from "./HistoryEditModal";
import CommentModal from "../CommentModal";
import { HistoryType } from "../../../types/HistoryType";

type Props = {
  histories: HistoryType[];
  title: string;
};

const HistoryConfirmTable: NextPage<Props> = ({ histories, title }) => {
  const [filterHistories, setFilterHistories] = useState([] as HistoryType[]);
  const users = useRecoilValue(usersState);
  const currentUser = useRecoilValue(currentUserState);
  const [items, setItems] = useState({
    scheduledAt: "",
    stockPlaceType: 1,
    quantity: 0,
    price: 0,
    comment: "",
    fixedAt: "",
  });

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

  const updateHistoryFabricDyeingConfirm = async (history: HistoryType) => {
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricDyeingConfirms", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = productDocSnap.data().externalStock || 0;
        const newStock = stock - history.quantity + items.quantity;
        transaction.update(productDocRef, {
          externalStock: newStock,
        });

        transaction.update(historyDocRef, {
          quantity: items.quantity,
          price: items.price,
          fixedAt: items.fixedAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const updateHistoryFabricPurchaseConfirm = async (history: HistoryType) => {
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricPurchaseConfirms", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = productDocSnap.data().tokushimaStock || 0;
        const newStock = stock - history.quantity + items.quantity;
        transaction.update(productDocRef, {
          tokushimaStock: newStock,
        });

        transaction.update(historyDocRef, {
          quantity: items.quantity,
          price: items.price,
          fixedAt: items.fixedAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
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

  return (
    <TableContainer p={6} w="100%">
      <Box as="h2" fontSize="2xl">
        {title}
      </Box>
      {filterHistories?.length > 0 ? (
        <Table mt={6} variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>発注NO.</Th>
              <Th>発注日</Th>
              <Th>仕上日</Th>
              <Th>担当者</Th>
              <Th>生地品番</Th>
              <Th>色</Th>
              <Th>品名</Th>
              <Th>数量</Th>
              <Th>単価</Th>
              <Th>金額</Th>
              <Th>コメント</Th>
              <Th>編集</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filterHistories?.map((history: HistoryType) => (
              <Tr key={history.id}>
                <Td>{getSerialNumber(history?.serialNumber)}</Td>
                <Td>{history?.orderedAt}</Td>
                <Td>{history?.fixedAt}</Td>
                <Td>{getCreateUserName(history.createUser)}</Td>
                <Td>{history.productNumber}</Td>
                <Td>{history.colorName}</Td>
                <Td>{history.productName}</Td>
                <Td>{history?.quantity}m</Td>
                <Td>{history?.price}円</Td>
                <Td>{history?.quantity * history?.price}円</Td>
                <Td w="100%" textAlign="center">
                  {history.orderType === "dyeing" &&
                    elementComment(history, "historyFabricDyeingConfirms")}
                  {history.orderType === "purchase" &&
                    elementComment(history, "historyFabricPurchaseConfirms")}
                </Td>
                <Td>
                  <Flex gap={3}>
                    <HistoryEditModal
                      history={history}
                      type="confirm"
                      items={items}
                      setItems={setItems}
                      onClick={() => {
                        if (history.orderType === "dyeing") {
                          updateHistoryFabricDyeingConfirm(history);
                        }
                        if (history.orderType === "purchase") {
                          updateHistoryFabricPurchaseConfirm(history);
                        }
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

export default HistoryConfirmTable;
