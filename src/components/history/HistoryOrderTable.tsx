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
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { todayDate } from "../../../functions";
import { currentUserState, usersState } from "../../../store";
import { HistoryEditModal } from "./HistoryEditModal";
import HistoryOrderToConfirmModal from "./HistoryOrderToConfirmModal";
import CommentModal from "../CommentModal";
import { HistoryType } from "../../../types/HistoryType";
import { useGetDisp } from "../../hooks/UseGetDisp";

type Props = {
  histories: HistoryType[];
  title: string;
  orderType: string;
};

const HistoryOrderTable: NextPage<Props> = ({
  histories,
  title,
  orderType,
}) => {
  const HOUSE_FACTORY = "徳島工場";
  const [filterHistories, setFilterHistories] = useState<any>();
  const currentUser = useRecoilValue(currentUserState);
  const users = useRecoilValue(usersState);
  const [items, setItems] = useState({} as HistoryType);
  const { getSerialNumber } = useGetDisp()

  // 数量０のデータを非表示
  useEffect(() => {
    const newHistorys = histories?.filter(
      (history: { quantity: number }) => history.quantity > 0
    );
    setFilterHistories(newHistorys);
  }, [histories]);

  // 担当者の表示
  const getUserName = (userId: string) => {
    if (userId === "R&D") {
      return "R&D";
    } else {
      const user = users.find((user: { uid: string }) => userId === user.uid);
      return user?.name;
    }
  };

  // 生地仕掛状況　Orderを削除 type stock
  const deleteHistoryFabricDyeingOrderStock = async (history: any) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDoSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDoSnap.exists())
          throw "grayFabricDoSnap document does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        let stock = await grayFabricDoSnap.data().stock || 0;
        const newStock = stock + history.quantity;
        transaction.update(grayFabricDocRef, {
          stock: newStock,
        });

        let wip = await productDocSnap.data().wip || 0;
        const newWip = wip - history.quantity;
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.delete(historyDocRef);
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };
  // 生地仕掛状況　Orderを削除  type ranning
  const deleteHistoryFabricDyeingOrderRanning = async (
    history: HistoryType
  ) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        let wip = await productDocSnap.data().wip || 0;
        const newWip = wip - history.quantity;
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.delete(historyDocRef);
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　生地仕掛状況　Order　編集（Stock在庫）
  const updateHistoryFabricDyeingOrderStock = async (history: HistoryType) => {
    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricId);
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabricDocSnap does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = await grayFabricDocSnap.data().stock || 0;
        const newStock = stock + history.quantity - items.quantity;
        transaction.update(grayFabricDocRef, {
          stock: newStock,
        });

        const wip = await productDocSnap.data().wip || 0;
        const newWip = wip - history.quantity + items.quantity;
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.update(historyDocRef, {
          quantity: items.quantity,
          price: items.price,
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　生地仕掛状況　Order　編集（ranning在庫）
  const updateHistoryFabricDyeingOrderRanning = async (
    history: HistoryType
  ) => {
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const wip = await productDocSnap.data().wip || 0;
        const newWip = wip - history.quantity + items.quantity;
        transaction.update(productDocRef, {
          wip: newWip,
        });

        transaction.update(historyDocRef, {
          quantity: items.quantity,
          price: items.price,
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  // 生地染色　確定処理
  const confirmProcessingFabricDyeing = async (history: HistoryType) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const orderHistoryDocRef = doc(db, "historyFabricDyeingOrders", history.id);
    const confirmHistoryDocRef = doc(collection(db, "historyFabricDyeingConfirms"));

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        const newWip =
          await productDocSnap.data()?.wip -
          history.quantity +
          items.remainingOrder || 0;

        const newStock =
          await productDocSnap.data()?.externalStock + items.quantity || 0;
        transaction.update(productDocRef, {
          wip: newWip,
          externalStock: newStock,
        });

        transaction.update(orderHistoryDocRef, {
          quantity: items.remainingOrder,
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt || todayDate(),
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });

        transaction.set(confirmHistoryDocRef, {
          serialNumber: history.serialNumber,
          orderType: history.orderType,
          grayFabricId: history.grayFabricId,
          productId: history.productId,
          productNumber: history.productNumber,
          productName: history.productName,
          colorName: history.colorName,
          supplierId: history.supplierId,
          supplierName: history.supplierName,
          price: history.price,
          quantity: items.quantity,
          comment: items.comment,
          orderedAt: items.orderedAt || history.orderedAt,
          fixedAt: items.fixedAt || todayDate(),
          createUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  // 購入状況　orderを削除（stock ranning共通）
  const deleteHistoryFabricPurchaseOrder = async (history: any) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricPurchaseOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockType === "stock") {
          const externalStock = await productDocSnap.data().externalStock || 0;
          const newExternalStock = externalStock + history.quantity;
          const arrivingQuantity = await productDocSnap.data().arrivingQuantity || 0;
          const newArrivingQuantity = arrivingQuantity - history.quantity;
          transaction.update(productDocRef, {
            externalStock: newExternalStock,
            arrivingQuantity: newArrivingQuantity,
          });
        }
        if (history.stockType === "ranning") {
          const arrivingQuantity = await productDocSnap.data().arrivingQuantity || 0;
          const newArrivingQuantity = arrivingQuantity - history.quantity;
          transaction.update(productDocRef, {
            arrivingQuantity: newArrivingQuantity,
          });
        }

        transaction.delete(historyDocRef);
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　購入状況　orderを編集（stock ranning共通）
  const updateHistoryFabricPurchaseOrder = async (history: HistoryType) => {
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricPurchaseOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockType === "stock") {
          const externalStock = await productDocSnap.data().externalStock || 0;
          const newExternalStock =
            externalStock + history.quantity - items.quantity;

          const arrivingQuantity = await productDocSnap.data().arrivingQuantity || 0;
          const newArrivingQuantity =
            arrivingQuantity - history.quantity + items.quantity;

          transaction.update(productDocRef, {
            externalStock: newExternalStock,
            arrivingQuantity: newArrivingQuantity,
          });
        }
        if (history.stockType === "ranning") {
          const arrivingQuantity = await productDocSnap.data().arrivingQuantity || 0;
          const newArrivingQuantity =
            arrivingQuantity - history.quantity + items.quantity;

          transaction.update(productDocRef, {
            arrivingQuantity: newArrivingQuantity,
          });
        }

        transaction.update(historyDocRef, {
          quantity: items.quantity,
          price: items.price,
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  // 購入状況　確定処理
  const confirmProcessingFabricPurchase = async (history: HistoryType) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const orderHistoryDocRef = doc(
      db,
      "historyFabricPurchaseOrders",
      history.id
    );
    const confirmHistoryDocRef = doc(collection(db, "historyFabricPurchaseConfirms"));

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        const newArrivingQuantity =
          await productDocSnap.data()?.arrivingQuantity -
          history.quantity +
          items.remainingOrder || 0;

        let newTokushimaStock = 0;
        if (items.stockPlace === HOUSE_FACTORY) {
          newTokushimaStock =
            await productDocSnap.data()?.tokushimaStock + items.quantity || 0;
        }

        transaction.update(productDocRef, {
          arrivingQuantity: newArrivingQuantity,
          tokushimaStock: newTokushimaStock,
        });

        transaction.update(orderHistoryDocRef, {
          quantity: items.remainingOrder,
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt || todayDate(),
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });

        transaction.set(confirmHistoryDocRef, {
          serialNumber: history.serialNumber,
          orderType: history.orderType,
          grayFabricId: history.grayFabricId,
          productId: history.productId,
          productNumber: history.productNumber,
          productName: history.productName,
          colorName: history.colorName,
          supplierId: history.supplierId,
          supplierName: history.supplierName,
          price: history.price,
          quantity: items.quantity,
          stockPlace: items.stockPlace,
          comment: items.comment,
          orderedAt: items.orderedAt || history.orderedAt,
          fixedAt: items.fixedAt || todayDate(),
          createUser: currentUser,
          updateUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
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

  const elmentEditDelete = (
    history: HistoryType,
    onClickUpdate: Function,
    onClickDelete: Function
  ) => (
    <Flex gap={3}>
      <HistoryEditModal
        history={history}
        type="order"
        items={items}
        setItems={setItems}
        onClick={() => onClickUpdate(history)}
      />
      <FaTrashAlt cursor="pointer" onClick={() => onClickDelete(history)} />
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
              <Th>確定</Th>
              <Th>発注NO.</Th>
              <Th>発注日</Th>
              <Th>仕上予定日</Th>
              <Th>担当者</Th>
              <Th>品番</Th>
              <Th>色</Th>
              <Th>品名</Th>
              <Th>数量</Th>
              <Th>単価</Th>
              <Th>金額</Th>
              {orderType === "purchase" && <Th>出荷先</Th>}
              <Th>コメント</Th>
              <Th>編集/削除</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filterHistories?.map((history: HistoryType) => (
              <Tr key={history.id}>
                <Td>
                  <HistoryOrderToConfirmModal
                    history={history}
                    items={items}
                    setItems={setItems}
                    onClick={() => {
                      if (history.orderType === "dyeing") {
                        confirmProcessingFabricDyeing(history);
                      }
                      if (history.orderType === "purchase") {
                        confirmProcessingFabricPurchase(history);
                      }
                    }}
                  />
                </Td>
                <Td>{getSerialNumber(history?.serialNumber)}</Td>
                <Td>{history?.orderedAt}</Td>
                <Td>{history?.scheduledAt}</Td>
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
                {history.orderType === "purchase" && (
                  <Td>{history?.stockPlace}</Td>
                )}
                <Td w="100%" textAlign="center">
                  {history.orderType === "dyeing" &&
                    elementComment(history, "historyFabricDyeingOrders")}
                  {history.orderType === "purchase" &&
                    elementComment(history, "historyFabricDyeingOrders")}
                </Td>
                <Td>
                  <Flex gap={3}>
                    {history.orderType === "dyeing" && (
                      <>
                        {history.stockType === "stock" &&
                          elmentEditDelete(
                            history,
                            updateHistoryFabricDyeingOrderStock,
                            deleteHistoryFabricDyeingOrderStock
                          )}
                        {history.stockType === "ranning" &&
                          elmentEditDelete(
                            history,
                            updateHistoryFabricDyeingOrderRanning,
                            deleteHistoryFabricDyeingOrderRanning
                          )}
                      </>
                    )}
                    {history.orderType === "purchase" &&
                      elmentEditDelete(
                        history,
                        updateHistoryFabricPurchaseOrder,
                        deleteHistoryFabricPurchaseOrder
                      )}
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

export default HistoryOrderTable;
