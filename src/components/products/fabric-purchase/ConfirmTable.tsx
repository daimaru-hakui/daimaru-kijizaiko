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
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../../../firebase";
import { currentUserState, loadingState, usersState } from "../../../../store";
import CommentModal from "../../CommentModal";
import { HistoryType } from "../../../../types/HistoryType";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { HistoryEditModal } from "../../history/HistoryEditModal";
import { useAPI } from "../../../hooks/UseAPI";
import { useRouter } from "next/router";

const FabricPurchaseConfirmTable: NextPage = () => {
  const HOUSE_FACTORY = "徳島工場";
  const router = useRouter();
  const setLoading = useSetRecoilState(loadingState);
  const [filterHistories, setFilterHistories] = useState([] as HistoryType[]);
  const users = useRecoilValue(usersState);
  const currentUser = useRecoilValue(currentUserState);
  const { getSerialNumber } = useGetDisp();
  const [items, setItems] = useState({
    scheduledAt: "",
    stockPlaceType: 1,
    quantity: 0,
    price: 0,
    comment: "",
    fixedAt: "",
  });
  const { data, mutate } = useAPI("/api/fabric-purchase-confirms");
  mutate("/api/fabric-purchase-confirms");

  useEffect(() => {
    const newHistorys = data?.contents?.filter(
      (history: { quantity: number; }) => history.quantity > 0
    );
    setFilterHistories(newHistorys);
  }, [data]);

  // 担当者の表示
  const getUserName = (userId: string) => {
    if (userId === "R&D") {
      return "R&D";
    } else {
      const user = users.find((user: { uid: string; }) => userId === user.uid);
      return user?.name;
    }
  };

  const updateHistoryFabricPurchaseConfirm = async (history: HistoryType) => {
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricPurchaseConfirms", history.id);
    setLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockPlace === HOUSE_FACTORY) {
          const stock = (await productDocSnap.data().tokushimaStock) || 0;
          const newStock = stock - history.quantity + items.quantity;
          transaction.update(productDocRef, {
            tokushimaStock: newStock,
          });
        }

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
      setLoading(false);
      router.push("/products/fabric-purchase/confirms");
    }
  };

  const elementComment = (history: HistoryType, collectionName: string) => (
    <Flex gap={3}>
      <CommentModal
        id={history.id}
        comment={history.comment}
        collectionName={collectionName}
        mutate={mutate}
      />
      {history?.comment.slice(0, 20) +
        (history.comment.length >= 1 ? "..." : "")}
    </Flex>
  );

  return (
    <TableContainer p={6} w="100%">
      <Box as="h2" fontSize="2xl">
        購入履歴
      </Box>
      {filterHistories?.length > 0 ? (
        <Table mt={6} variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>発注NO.</Th>
              <Th>発注日</Th>
              <Th>入荷日</Th>
              <Th>担当者</Th>
              <Th>生地品番</Th>
              <Th>色</Th>
              <Th>品名</Th>
              <Th>数量</Th>
              <Th>単価</Th>
              <Th>金額</Th>
              <Th>出荷先</Th>
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
                <Td>{getUserName(history.createUser)}</Td>
                <Td>{history.productNumber}</Td>
                <Td>{history.colorName}</Td>
                <Td>{history.productName}</Td>
                <Td>{history?.quantity}m</Td>
                <Td>{history?.price}円</Td>
                <Td>{history?.quantity * history?.price}円</Td>
                <Td>{history?.stockPlace}</Td>
                <Td w="100%">
                  {elementComment(history, "fabricPurchaseConfirms")}
                </Td>
                <Td>
                  {history.accounting !== true ? (
                    <HistoryEditModal
                      history={history}
                      type="confirm"
                      items={items}
                      setItems={setItems}
                      onClick={() => {
                        updateHistoryFabricPurchaseConfirm(history);
                      }}
                      orderType=""
                      mutate={mutate}
                    />
                  ) : (
                    "金額確認済"
                  )}
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

export default FabricPurchaseConfirmTable;
