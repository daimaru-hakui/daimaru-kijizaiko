import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextPage } from "next";
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { todayDate } from "../../../functions";
import { currentUserState, suppliersState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";
import { useGetDisplay } from "../../hooks/useGetDisplay";

type Props = {
  grayFabric: GrayFabricType;
};

const GrayFabricOrderAreaModal: NextPage<Props> = ({ grayFabric }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useRecoilValue(currentUserState);
  const { getSupplierName } = useGetDisplay()
  const [items, setItems] = useState({
    orderedAt: "",
    scheduledAt: "",
    quantity: 0,
    comment: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };



  // キバタ仕掛発注
  const orderGrayFabric = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;

    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "grayFabricOrderNumbers"
    );
    const grayFabricDocRef = doc(db, "grayFabrics", grayFabric.id);
    const orderHistoryRef = collection(db, "historyGrayFabricOrders");

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists()) throw "Document does not exist!";

        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "Document does not exist!";

        const newSerialNumber = orderNumberDocSnap.data().serialNumber + 1;
        transaction.update(orderNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        const newWipGrayFabric =
          grayFabricDocSnap.data()?.wip + items.quantity || 0;
        transaction.update(grayFabricDocRef, {
          wip: newWipGrayFabric,
        });

        await addDoc(orderHistoryRef, {
          serialNumber: newSerialNumber,
          grayFabricId: grayFabricDocSnap?.id,
          productNumber: grayFabric?.productNumber,
          productName: grayFabric?.productName,
          price: grayFabric?.price,
          quantity: items.quantity,
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt || todayDate(),
          comment: items.comment,
          createUser: currentUser,
          supplierId: grayFabric?.supplierId,
          supplierName: getSupplierName(grayFabric?.supplierId),
          createdAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      onClose();
    }
  };

  return (
    <>
      <Button colorScheme="facebook" size="xs" onClick={onOpen}>
        発注
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>キバタ発注</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <Divider />

              <Box mt={6} fontSize="xl">
                <Flex>
                  <Text mr={1} fontWeight="bold">
                    品番
                  </Text>
                  <Flex>
                    <Text mr={3}>{grayFabric?.productNumber}</Text>
                    {grayFabric?.productName}
                  </Flex>
                </Flex>
              </Box>
              <Flex
                gap={3}
                w="100%"
                flexDirection={{ base: "column", md: "row" }}
              >
                <Box w="100%">
                  <Box>発注日</Box>
                  <Input
                    mt={1}
                    type="date"
                    name="orderedAt"
                    value={items.orderedAt || todayDate()}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box w="100%">
                  <Box>予定日</Box>
                  <Input
                    mt={1}
                    type="date"
                    name="scheduledAt"
                    value={items.scheduledAt || todayDate()}
                    onChange={handleInputChange}
                  />
                </Box>

                <Box w="100%">
                  <Text>数量（m）</Text>
                  <NumberInput
                    mt={1}
                    w="100%"
                    name="quantity"
                    defaultValue={0}
                    min={0}
                    max={100000}
                    value={items.quantity === 0 ? "" : items.quantity}
                    onChange={(e) => handleNumberChange(e, "quantity")}
                  >
                    <NumberInputField textAlign="right" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>
              </Flex>
              <Box w="100%">
                <Text>備考</Text>
                <Textarea
                  mt={1}
                  name="comment"
                  value={items.comment}
                  onChange={handleInputChange}
                />
              </Box>
              <Button
                colorScheme="facebook"
                disabled={!items.quantity}
                onClick={orderGrayFabric}
              >
                登録する
              </Button>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>閉じる</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GrayFabricOrderAreaModal;
