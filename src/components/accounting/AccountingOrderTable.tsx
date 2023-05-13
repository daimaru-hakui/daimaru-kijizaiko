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
import { History } from "../../../types";
import { AccountingEditModal } from "./AccountingEditModal";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { AccountingOrderToConfirmModal } from "./AccountingOrderToConfirmModal";
import { SearchArea } from "../SearchArea";
import { useForm, FormProvider } from "react-hook-form";
import { useUtil } from "../../hooks/UseUtil";
import { useSWRPurchaseConfirms } from "../../hooks/swr/useSWRPurchaseConfirms";

type Inputs = {
  start: string;
  end: string;
  client: string;
  staff: string;
};

export const AccountingOrderTable: FC = () => {
  const [filterHistories, setFilterHistories] = useState<History[]>();
  const { getUserName, getSerialNumber } = useGetDisp();
  const { getTodayDate, get3monthsAgo } = useUtil();
  const [staff, setStaff] = useState("");
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const { data } = useSWRPurchaseConfirms(startDay, endDay);
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
    setFilterHistories(
      data?.contents
        ?.filter((history) =>
          (staff === history.createUser && history.accounting === true) ||
          (staff === "" && history.accounting !== true))
    );
  }, [data, staff]);

  const elementComment = (history: History, collectionName: string) => (
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
      <TableContainer px={6} pt={6} pb={0} w="100%" overflowX="unset" overflowY="unset">
        <Box
          mt={3}
          w="full"
          overflowX="auto"
          position="relative"
          h={{
            base: "calc(100vh - 405px)",
            md: "calc(100vh - 360px)",
            lg: "calc(100vh - 310px)",
          }}
        >
          {filterHistories?.length > 0 ? (
            <Table variant="simple" size="sm">
              <Thead position="sticky" top={0} zIndex="docked" bg="white">
                <Tr>
                  <Th>確定</Th>
                  <Th>発注NO.</Th>
                  <Th>発注日</Th>
                  <Th>仕上日</Th>
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
                {filterHistories?.map((history) => (
                  <Tr key={history.id}>
                    <Td>
                      <AccountingOrderToConfirmModal history={history} startDay={startDay} endDay={endDay} />
                    </Td>
                    <Td>{getSerialNumber(history?.serialNumber)}</Td>
                    <Td>{history?.orderedAt}</Td>
                    <Td>{history?.fixedAt}</Td>
                    <Td>{getUserName(history.createUser)}</Td>
                    <Td>{history.productNumber}</Td>
                    {history.colorName && <Td>{history.colorName}</Td>}
                    <Td>{history.productName}</Td>
                    <Td isNumeric>{history?.quantity.toLocaleString()}m</Td>
                    {history.price && (
                      <>
                        <Td isNumeric>{history?.price.toLocaleString()}円</Td>
                        <Td isNumeric>
                          {(history?.quantity * history?.price).toLocaleString()}円
                        </Td>
                      </>
                    )}
                    <Td>{history?.stockPlace}</Td>
                    <Td w="100%" textAlign="center">
                      {elementComment(history, "fabricPurchaseConfirms")}
                    </Td>
                    <Td>
                      <Flex gap={3}>
                        <AccountingEditModal history={history} startDay={startDay} endDay={endDay} />
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Box textAlign="center">現在登録された情報はありません。</Box>
          )}
        </Box>
      </TableContainer>
    </>
  );
};
