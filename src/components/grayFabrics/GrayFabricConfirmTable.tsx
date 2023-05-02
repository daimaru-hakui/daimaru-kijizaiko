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
import { useState, useEffect, FC } from "react";
import { db } from "../../../firebase";
import { GrayFabricType, HistoryType } from "../../../types";
import { useUtil } from "../../hooks/UseUtil";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { CommentModal } from "../CommentModal";
import { HistoryEditModal } from "../history/HistoryEditModal";
import { SearchArea } from "../SearchArea";
import { useForm, FormProvider } from "react-hook-form";
import { useSWRGrayFavricConfirms } from "../../hooks/swr/useSWRGrayFavricConfirms";
import { useAuthStore } from "../../../store";

type Inputs = {
  start: string;
  end: string;
  client: string;
  staff: string;
};

export const GrayFabricConfirmTable: FC = () => {
  const [items, setItems] = useState({} as HistoryType);
  const { getSerialNumber, getUserName } = useGetDisp();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { isAuths } = useAuthManagement();
  const { getTodayDate, get3monthsAgo } = useUtil();
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const [filterGrayFabrics, setFilterGrayFabrics] = useState(
    [] as HistoryType[]
  );
  const { data, mutate } = useSWRGrayFavricConfirms(startDay, endDay);

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
      setFilterGrayFabrics(data?.contents);
    } else {
      setFilterGrayFabrics(
        data?.contents?.filter(
          (content: GrayFabricType) =>
            staff === content.createUser || staff === ""
        )
      );
    }
  }, [data, staff]);

  const updateConfirmHistory = async (history: any) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const historyDocRef = doc(db, "grayFabricConfirms", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabricDocSnap does not exist!!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "historyDocSnap does not exist!";

        const newStock =
          (await grayFabricDocSnap.data()?.stock) -
            history.quantity +
            Number(items.quantity) || 0;
        transaction.update(grayFabricDocRef, {
          stock: newStock,
        });

        transaction.update(historyDocRef, {
          quantity: Number(items.quantity),
          orderedAt: items.orderedAt,
          fixedAt: items.fixedAt,
          comment: items.comment,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      mutate({ ...data });
    }
  };
  return (
    <>
      <FormProvider {...methods}>
        <SearchArea onSubmit={onSubmit} onReset={onReset} />
      </FormProvider>
      <TableContainer p={6} pt={0} w="100%">
        {filterGrayFabrics?.length > 0 ? (
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>発注NO.</Th>
                <Th>発注日</Th>
                <Th>仕上日</Th>
                <Th>担当者</Th>
                <Th>品番</Th>
                <Th>品名</Th>
                <Th>仕入先</Th>
                <Th>数量</Th>
                <Th>コメント</Th>
                <Th>編集</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterGrayFabrics?.map((history: any) => (
                <Tr key={history.id}>
                  <Td>{getSerialNumber(history.serialNumber)}</Td>
                  <Td>{history.orderedAt}</Td>
                  <Td>{history.fixedAt}</Td>
                  <Td>{getUserName(history.createUser)}</Td>
                  <Td>{history.productNumber}</Td>
                  <Td>{history.productName}</Td>
                  <Td>{history.supplierName}</Td>
                  <Td isNumeric>{history?.quantity}m</Td>
                  <Td w="100%">
                    <Flex gap={3}>
                      <CommentModal
                        id={history.id}
                        comment={history.comment}
                        collectionName="historyGrayFabricConfirms"
                      />
                      {history?.comment.slice(0, 20) +
                        (history.comment.length >= 1 ? "..." : "")}
                    </Flex>
                  </Td>
                  <Td>
                    {(isAuths(["rd"]) ||
                      history.createUser === currentUser) && (
                      <HistoryEditModal
                        history={history}
                        type="confirm"
                        items={items}
                        setItems={setItems}
                        onClick={updateConfirmHistory}
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
