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
import { useEffect, useState, FC } from "react";
import { CommentModal } from "../CommentModal";
import { HistoryType } from "../../../types";
import { AccountingEditModal } from "./AccountingEditModal";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { SearchArea } from "../SearchArea";
import { useForm, FormProvider } from "react-hook-form";
import { useSWRPurchaseConfirms } from "../../hooks/swr/useSWRPurchaseConfirms";
import { useUtil } from "../../hooks/UseUtil";

type Inputs = {
  start: string;
  end: string;
  client: string;
  staff: string;
};

export const AccountingConfirmTable: FC = () => {
  const [filterHistories, setFilterHistories] = useState([] as HistoryType[]);
  const { getUserName, getSerialNumber } = useGetDisp();
  const { getTodayDate, get3monthsAgo } = useUtil();
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const { data, mutate } = useSWRPurchaseConfirms(startDay, endDay);

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
      setFilterHistories(
        data?.contents.filter(
          (history: HistoryType) => history.accounting === true && history
        )
      );
    } else {
      setFilterHistories(
        data?.contents
          ?.filter(
            (content: HistoryType) =>
              staff === content.createUser || staff === ""
          )
          .filter(
            (history: HistoryType) => history.accounting === true && history
          )
      );
    }
  }, [data, staff]);

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

  const elmentEdit = (history: HistoryType) => (
    <Flex gap={3}>
      <AccountingEditModal type="order" history={history} />
    </Flex>
  );

  return (
    <>
      <FormProvider {...methods}>
        <SearchArea onSubmit={onSubmit} onReset={onReset} />
      </FormProvider>
      <TableContainer p={6} pt={0} w="100%">
        {filterHistories?.length > 0 ? (
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>発注NO.</Th>
                <Th>発注日</Th>
                <Th>入荷日</Th>
                <Th>担当者</Th>
                <Th>品番</Th>
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
                  {history.colorName && <Td>{history.colorName}</Td>}
                  <Td>{history.productName}</Td>
                  <Td>{history?.quantity.toLocaleString()}m</Td>
                  {history.price && (
                    <>
                      <Td>{history?.price.toLocaleString()}円</Td>
                      <Td>
                        {(history?.quantity * history?.price).toLocaleString()}
                        円
                      </Td>
                    </>
                  )}
                  <Td>{history?.stockPlace}</Td>
                  <Td w="100%" textAlign="center">
                    {elementComment(history, "fabricPurchaseConfirms")}
                  </Td>
                  <Td>
                    <Flex gap={3}>{elmentEdit(history)}</Flex>
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
