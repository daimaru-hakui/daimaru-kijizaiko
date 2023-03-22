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
import { useEffect, useState } from "react";
import CommentModal from "../CommentModal";
import { HistoryType } from "../../../types/HistoryType";
import { AccountingEditModal } from "./AccountingEditModal";
import AccountingHistoryOrderToConfirmModal from "./AccountingOrderToConfirmModal";
import { useGetDisp } from "../../hooks/UseGetDisp";
import useSWR from "swr";

const AccountingOrderTable = () => {
  const [filterHistories, setFilterHistories] = useState<any>();
  const { getUserName, getSerialNumber } = useGetDisp();
  const { data, mutate, isLoading } = useSWR("/api/fabric-purchase-confirms");

  // 数量０のデータを非表示
  useEffect(() => {
    const newHistorys = data?.contents?.filter(
      (history: HistoryType) => history.accounting !== true && history
    );
    setFilterHistories(newHistorys);
  }, [data]);

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
    <TableContainer p={6} pt={0} w="100%">
      {filterHistories?.length > 0 ? (
        <Table mt={6} variant="simple" size="sm">
          <Thead>
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
            {filterHistories?.map((history: HistoryType) => (
              <Tr key={history.id}>
                <Td>
                  <AccountingHistoryOrderToConfirmModal history={history} />
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
                  <Flex gap={3}>{elmentEdit(history)}</Flex>
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

export default AccountingOrderTable;
