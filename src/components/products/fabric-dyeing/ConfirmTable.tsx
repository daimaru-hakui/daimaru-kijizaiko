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
import { useEffect, useState, FC } from "react";
import { useAuthStore, useLoadingStore } from "../../../../store";
import { CommentModal } from "../../CommentModal";
import { HistoryType } from "../../../../types";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { db } from "../../../../firebase";
import { HistoryEditModal } from "../../history/HistoryEditModal";
import { useAuthManagement } from "../../../hooks/UseAuthManagement";
import { useUtil } from "../../../hooks/UseUtil";
import { useForm, FormProvider } from "react-hook-form";
import { SearchArea } from "../../SearchArea";
import { useSWRFabricDyeingConfirms } from "../../../hooks/swr/useSWRFabricDyeingConfirms";

type Inputs = {
  start: string;
  end: string;
  client: string;
  staff: string;
};

export const FabricDyeingConfirmTable: FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const { getTodayDate, get3monthsAgo } = useUtil();
  const [filterHistories, setFilterHistories] = useState([] as HistoryType[]);
  const { isAuths } = useAuthManagement();
  const { getSerialNumber, getUserName } = useGetDisp();
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

  const { data, mutate } = useSWRFabricDyeingConfirms(startDay, endDay);
  const methods = useForm<Inputs>({
    defaultValues: {
      start: startDay,
      end: endDay,
      staff: "",
    },
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
    methods.reset();
  };

  useEffect(() => {
    if (!staff) {
      setFilterHistories(data?.contents);
    } else {
      setFilterHistories(
        data?.contents
          ?.filter((history) => history.quantity > 0 && history)
          .filter(
            (content: HistoryType) =>
              staff === content.createUser || staff === ""
          )
      );
    }
  }, [data, staff]);

  const updateFabricDyeingConfirm = async (history: HistoryType) => {
    setIsLoading(true);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "fabricDyeingConfirms", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = (await productDocSnap.data().externalStock) || 0;
        const newStock = stock - history.quantity + Number(items.quantity);
        transaction.update(productDocRef, {
          externalStock: Number(newStock),
        });

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
          price: Number(items.price),
          fixedAt: items.fixedAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
      mutate({ ...data });
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
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
    <>
      <FormProvider {...methods}>
        <SearchArea onSubmit={onSubmit} onReset={onReset} />
      </FormProvider>
      <TableContainer p={6} w="100%">
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
              {filterHistories?.map((history) => (
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
                  <Td isNumeric>
                    {(history?.quantity * history?.price).toLocaleString()}円
                  </Td>
                  <Td w="100%">
                    {elementComment(history, "fabricDyeingConfirms")}
                  </Td>
                  <Td>
                    {(isAuths(["rd"]) ||
                      history?.createUser === currentUser) && (
                      <HistoryEditModal
                        history={history}
                        type="confirm"
                        items={items}
                        setItems={setItems}
                        onClick={() => updateFabricDyeingConfirm(history)}
                        orderType=""
                      />
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Box mt={6} textAlign="center">
            現在登録された情報はありません。
          </Box>
        )}
      </TableContainer>
    </>
  );
};
