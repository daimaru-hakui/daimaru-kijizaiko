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
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useState, FC } from "react";
import { db } from "../../../firebase";
import { useAuthStore } from "../../../store";
import { GrayFabric } from "../../../types";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";

type Props = {
  grayFabric: GrayFabric;
};

export const GrayFabricOrderAreaModal: FC<Props> = ({ grayFabric }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { getSupplierName } = useGetDisp();
  const { getTodayDate } = useUtil();
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
    const grayFabricDocRef = doc(db, "grayFabrics", grayFabric.id);
    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "grayFabricOrderNumbers"
    );
    const orderHistoryRef = collection(db, "grayFabricOrders");

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists()) throw "serialNumbers does not exist!";

        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabricOrders does not exist!";

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
          orderedAt: items.orderedAt || getTodayDate(),
          scheduledAt: items.scheduledAt || getTodayDate(),
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
      router.push("/gray-fabrics/orders");
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
                direction={{ base: "column", md: "row" }}
              >
                <Box w="100%">
                  <Box>発注日</Box>
                  <Input
                    mt={1}
                    type="date"
                    name="orderedAt"
                    value={items.orderedAt || getTodayDate()}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box w="100%">
                  <Box>予定日</Box>
                  <Input
                    mt={1}
                    type="date"
                    name="scheduledAt"
                    value={items.scheduledAt || getTodayDate()}
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
