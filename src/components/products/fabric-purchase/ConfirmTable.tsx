import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
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
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../../../firebase";
import { currentUserState, loadingState } from "../../../../store";
import CommentModal from "../../CommentModal";
import { HistoryType } from "../../../../types/HistoryType";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { HistoryEditModal } from "../../history/HistoryEditModal";
import { useAuthManagement } from "../../../hooks/UseAuthManagement";
import { useUtil } from "../../../hooks/UseUtil";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";

type Props = {
  HOUSE_FACTORY?: string;
};

type Inputs = {
  start: string;
  end: string;
  client: string;
  staff: string;
};

const FabricPurchaseConfirmTable: NextPage<Props> = ({ HOUSE_FACTORY }) => {
  const setLoading = useSetRecoilState(loadingState);
  const [filterHistories, setFilterHistories] = useState([] as HistoryType[]);
  const currentUser = useRecoilValue(currentUserState);
  const { getTodayDate, get3monthsAgo } = useUtil();
  const { getSerialNumber, getUserName } = useGetDisp();
  const { isAuths } = useAuthManagement();
  const [items, setItems] = useState({
    scheduledAt: "",
    stockPlaceType: 1,
    quantity: 0,
    price: 0,
    comment: "",
    fixedAt: "",
  });
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const { data: users } = useSWRImmutable(`/api/users/sales`);
  const { data, mutate } = useSWR(`/api/fabric-purchase-confirms/${startDay}/${endDay}?createUser=${staff}`);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      start: startDay,
      end: endDay,
      staff: "",
    }
  });

  const onSubmit = (data: Inputs) => {
    setStartDay(data.start);
    setEndDay(data.end);
    setStaff(data.staff);
  };
  const onReset = () => {
    setStartDay(get3monthsAgo());
    setEndDay(getTodayDate());
    setStaff("");
    reset();
  };

  useEffect(() => {
    data?.contents?.sort(
      (a: { serialNumber: number; }, b: { serialNumber: number; }) =>
        (a.serialNumber > b.serialNumber) && - 1);
    if (HOUSE_FACTORY) {
      const newHistorys = data?.contents?.filter(
        (history: HistoryType) => {
          if (history.stockPlace === HOUSE_FACTORY) {
            return history;
          }
        }
      );
      setFilterHistories(newHistorys);
    } else {
      const newHistorys = data?.contents?.filter(
        (history: HistoryType) => history
      );
      setFilterHistories(newHistorys);
    }
  }, [data, HOUSE_FACTORY]);

  const updateFabricPurchaseConfirm = async (history: HistoryType) => {
    setLoading(true);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricPurchaseConfirms", history.id);
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
      mutate({ ...data });
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
          入荷履歴
        </Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex
            w="full"
            gap={6}
            flexDirection={{ base: "column", lg: "row" }}>
            <Box>
              <Heading as="h4" fontSize="md">
                期間を選択
              </Heading>
              <Flex
                mt={3}
                gap={3}
                alignItems="center"
                flexDirection={{ base: "column", lg: "row" }}
              >
                <Flex gap={3} w={{ base: "full", lg: "350px" }}>
                  <Input type="date" {...register("start")} />
                  <Input type="date" {...register("end")} />
                </Flex>
              </Flex>
            </Box>
            <Box>
              <Heading as="h4" fontSize="md">
                担当者を選択
              </Heading>
              <Flex
                mt={3}
                gap={3}
                alignItems="center"
                w="full"
                flexDirection={{ base: "column", lg: "row" }}
              >
                <Select placeholder="担当者を選択" {...register("staff")}                  >
                  {users?.contents?.map((user) => (
                    <option key={user.id} value={user.id}>{getUserName(user.id)}</option>
                  ))}
                </Select>
                <Button
                  type="submit"
                  w={{ base: "full", lg: "80px" }}
                  px={6}
                  colorScheme="facebook"
                >
                  検索
                </Button>
                <Button
                  w={{ base: "full", lg: "80px" }}
                  px={6}
                  variant="outline"
                  onClick={onReset}
                >
                  クリア
                </Button>
              </Flex>
            </Box>
          </Flex>
        </form>
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
                    <Td isNumeric>{history?.quantity.toLocaleString()}m</Td>
                    <Td isNumeric>{history?.price.toLocaleString()}円</Td>
                    <Td isNumeric>{(history?.quantity * history?.price).toLocaleString()}円</Td>
                    <Td>{history?.stockPlace}</Td>
                    <Td w="100%">
                      {elementComment(history, "fabricPurchaseConfirms")}
                    </Td>
                    <Td>
                      {history.accounting !== true ? (
                        (isAuths(['rd']) || history?.createUser === currentUser) && (
                          <HistoryEditModal
                            history={history}
                            type="confirm"
                            items={items}
                            setItems={setItems}
                            onClick={() => {
                              updateFabricPurchaseConfirm(history);
                            }}
                          />
                        )
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

export default FabricPurchaseConfirmTable;
