import {
  Box,
  Button,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useState, FC } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useAuthStore, useGrayFabricStore } from "../../../store";
import { History } from "../../../types";
import { OrderToConfirmModal } from "../history/OrderToConfirmModal";
import { CommentModal } from "../CommentModal";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { GrayFabricHistoryEditModal } from "./GrayFabriHistoryEditModal";
import { useGrayFabrics } from "../../hooks/useGrayFabrics";

export const GrayFabricOrderTable: FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [items, setItems] = useState<History>();
  const { isAuths } = useAuthManagement();
  const { getSerialNumber, getUserName } = useGetDisp();
  const grayFabricOrders = useGrayFabricStore((state) => state.grayFabricOrders);
  const { confirmProcessing, deleteGrayFabricOrder } = useGrayFabrics();


  return (
    <>
      <TableContainer p={6} pt={0} w="100%">
        {grayFabricOrders?.length > 0 ? (
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>処理</Th>
                <Th>発注NO.</Th>
                <Th>発注日</Th>
                <Th>予定納期</Th>
                <Th>担当者</Th>
                <Th>品番</Th>
                <Th>品名</Th>
                <Th>仕入先</Th>
                <Th>数量</Th>
                <Th>コメント</Th>
                <Th>編集/削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {grayFabricOrders?.map((history) => (
                <Tr key={history.id}>
                  <Td>
                    {isAuths(["rd"]) || history.createUser === currentUser ? (
                      <OrderToConfirmModal
                        history={history}
                        items={items}
                        setItems={setItems}
                        onClick={() => confirmProcessing(history, items)}
                      />
                    ) : (
                      <Button size="xs" disabled={true}>
                        確定
                      </Button>
                    )}
                  </Td>
                  <Td>{getSerialNumber(history.serialNumber)}</Td>
                  <Td>{history.orderedAt}</Td>
                  <Td>{history.scheduledAt}</Td>
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
                        collectionName="historyGrayFabricOrders"
                      />
                      {history?.comment.slice(0, 20) +
                        (history.comment.length >= 1 ? "..." : "")}
                    </Flex>
                  </Td>
                  <Td>

                    {(isAuths(["rd"]) || history.createUser === currentUser)
                      && (
                        <Flex alignItems="center" gap={3}>
                          <GrayFabricHistoryEditModal
                            history={history}
                            type="order"
                          />
                          <FaTrashAlt
                            color="#444"
                            cursor="pointer"
                            onClick={() => deleteGrayFabricOrder(history)}
                          />
                        </Flex>
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
    </>
  );
};
