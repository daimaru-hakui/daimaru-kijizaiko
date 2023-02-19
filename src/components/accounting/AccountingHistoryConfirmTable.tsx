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
import { NextPage } from "next";
import { useEffect, useState } from "react";
import CommentModal from "../CommentModal";
import { HistoryType } from "../../../types/HistoryType";
import { AccountingHistoryEditModal } from "./AccountingHistoryEditModal";
import { useGetDisp } from "../../hooks/UseGetDisp";

type Props = {
  histories: HistoryType[];
  title: string;
};

const AccountingHistoryConfirmTable: NextPage<Props> = ({
  histories,
  title,
}) => {
  const [filterHistories, setFilterHistories] = useState([] as HistoryType[]);
  const { getUserName, getSerialNumber } = useGetDisp()

  // 数量０のデータを非表示
  useEffect(() => {
    const newHistorys = histories?.filter(
      (history: HistoryType) =>
        history.accounting === true && history.quantity !== 0
    );
    setFilterHistories(newHistorys);
  }, [histories]);


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
      <AccountingHistoryEditModal
        type="order"
        history={history}
      />
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
                <Td>{history?.quantity}m</Td>
                {history.price && (
                  <>
                    <Td>{history?.price}円</Td>
                    <Td>{history?.quantity * history?.price}円</Td>
                  </>
                )}
                <Td>{history?.stockPlace}</Td>
                <Td w="100%" textAlign="center">
                  {elementComment(history, "historyFabricPurchaseConfirms")}
                </Td>
                <Td>
                  <Flex gap={3}>
                    {elmentEdit(history)}
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

export default AccountingHistoryConfirmTable;
