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
import { useEffect, useState, FC } from "react";
import { FaTrashAlt } from "react-icons/fa";
import {
  useAuthStore,
  useProductsStore,
} from "../../../../store";
import { CommentModal } from "../../CommentModal";
import { History } from "../../../../types";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { useAuthManagement } from "../../../hooks/UseAuthManagement";
import { HistoryEditModal } from "../../history/HistoryEditModal";
import { OrderToConfirmModal } from "../../history/OrderToConfirmModal";
import { useFabricPurchase } from "../../../hooks/products/useFabricPurchase";

type Props = {
  HOUSE_FACTORY?: string;
};

export const FabricPurchaseOrderTable: FC<Props> = ({ HOUSE_FACTORY }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [items, setItems] = useState({} as History);
  const { getSerialNumber, getUserName } = useGetDisp();
  const { isAdminAuth, isAuths } = useAuthManagement();
  const fabricPurchaseOrders = useProductsStore((state) => state.fabricPurchaseOrders);
  const [filterFabricPurchaseOrders, setFilterFabricPurchaseOrders] = useState(
    [] as History[]
  );

  const {
    deleteFabricPurchaseOrder,
    updateFabricPurchaseOrder,
    confirmProcessingFabricPurchase
  } = useFabricPurchase();

  useEffect(() => {
    if (HOUSE_FACTORY) {
      const newHistorys = fabricPurchaseOrders?.filter(
        (history) => history.stockPlace === HOUSE_FACTORY && history
      );
      setFilterFabricPurchaseOrders(newHistorys);
    } else {
      setFilterFabricPurchaseOrders(fabricPurchaseOrders);
    }
  }, [fabricPurchaseOrders, HOUSE_FACTORY]);

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

  const elmentEditDelete = (
    history: History,
    items,
    onClickUpdate: Function,
    onClickDelete: Function
  ) => (
    <Flex gap={3}>
      <HistoryEditModal
        history={history}
        type="order"
        onClick={() => onClickUpdate(history, items)}
        items={items}
        setItems={setItems}
      />
      {isAdminAuth() && (
        <FaTrashAlt
          color="#444"
          cursor="pointer"
          onClick={() => onClickDelete(history)}
        />
      )}
    </Flex>
  );

  return (
    <>
      <TableContainer p={6} pt={0} w="full">
        {filterFabricPurchaseOrders?.length > 0 ? (
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>確定</Th>
                <Th>発注NO.</Th>
                <Th>発注日</Th>
                <Th>入荷予定</Th>
                <Th>担当者</Th>
                <Th>品番</Th>
                <Th>色</Th>
                <Th>品名</Th>
                <Th>数量</Th>
                <Th>単価</Th>
                <Th>金額</Th>
                <Th>出荷先</Th>
                <Th>コメント</Th>
                <Th>編集/削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterFabricPurchaseOrders?.map((history) => (
                <Tr key={history.id}>
                  <Td>
                    {isAuths(["rd", "tokushima"]) ||
                      history.createUser === currentUser ? (
                      <OrderToConfirmModal
                        history={history}
                        items={items}
                        setItems={setItems}
                        onClick={() => confirmProcessingFabricPurchase(history, items)}
                      />
                    ) : (
                      <Button size="xs" disabled={true}>
                        入荷確定
                      </Button>
                    )}
                  </Td>
                  <Td>{getSerialNumber(history?.serialNumber)}</Td>
                  <Td>{history?.orderedAt}</Td>
                  <Td>{history?.scheduledAt}</Td>
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
                    {elementComment(history, "fabricDyeingOrders")}
                  </Td>
                  <Td>
                    {(isAuths(["rd"]) ||
                      history?.createUser === currentUser) && (
                        <Flex gap={3}>
                          {history.orderType === "purchase" &&
                            elmentEditDelete(
                              history,
                              items,
                              updateFabricPurchaseOrder,
                              deleteFabricPurchaseOrder
                            )}
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
