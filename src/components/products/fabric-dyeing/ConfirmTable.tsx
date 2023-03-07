import {
  Box,
  Flex,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { doc, runTransaction } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentUserState, loadingState, usersState } from "../../../../store";
import CommentModal from "../../CommentModal";
import { HistoryType } from "../../../../types/HistoryType";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { db } from "../../../../firebase";
import { HistoryEditModal } from "../../history/HistoryEditModal";
import { useRouter } from "next/router";
import useSWR from "swr";
import useSearch from "../../../hooks/UseSearch";


const FabricDyeingConfirmTable = () => {
  const setLoading = useSetRecoilState(loadingState);
  const [filterHistories, setFilterHistories] = useState([] as HistoryType[]);
  const users = useRecoilValue(usersState);
  const currentUser = useRecoilValue(currentUserState);
  const { getSerialNumber, getUserName } = useGetDisp();
  const [items, setItems] = useState({
    scheduledAt: "",
    stockPlaceType: 1,
    quantity: 0,
    price: 0,
    comment: "",
    fixedAt: "",
  });
  const { SearchElement, startDay, endDay } = useSearch();
  const { data, mutate, isLoading } = useSWR(`/api/fabric-dyeing-confirms/${startDay}/${endDay}`);

  useEffect(() => {
    const newHistorys = data?.contents?.filter(
      (history: { quantity: number; }) => history.quantity > 0 && history
    ).sort(
      (a: { serialNumber: number; }, b: { serialNumber: number; }) =>
        (a.serialNumber > b.serialNumber) && - 1);
    setFilterHistories(newHistorys);
  }, [data]);


  const updateFabricDyeingConfirm = async (history: HistoryType) => {
    setLoading(true);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingConfirms", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = (await productDocSnap.data().externalStock) || 0;
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
      mutate({ ...data });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
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
    <Box w="100%" my={6} p={6} >
      <Stack spacing={8}>
        <Box as="h2" fontSize="2xl">
          染色履歴
        </Box>
        <SearchElement />
        <TableContainer w="100%">
          {filterHistories?.length > 0 ? (
            <Table variant="simple" size="sm">
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
                    <Td isNumeric>{history?.quantity.toLocaleString()}m</Td>
                    <Td isNumeric>{history?.price.toLocaleString()}円</Td>
                    <Td isNumeric>{(history?.quantity * history?.price).toLocaleString()}円</Td>
                    <Td w="100%">
                      {elementComment(history, "fabricDyeingConfirms")}
                    </Td>
                    <Td>
                      {history.accounting !== true ? (
                        <HistoryEditModal
                          history={history}
                          type="confirm"
                          items={items}
                          setItems={setItems}
                          onClick={() => updateFabricDyeingConfirm(history)}
                          orderType=""
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
            <Box mt={6} textAlign="center">現在登録された情報はありません。</Box>
          )}
        </TableContainer>
      </Stack>
    </Box>
  );
};

export default FabricDyeingConfirmTable;
