import {
  Box,
  Button,
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
  Select,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { FC, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuthStore, useProductsStore } from "../../../store";
import { db } from "../../../firebase";
import { arrayUnion, doc, runTransaction } from "firebase/firestore";

type Props = {
  title: string;
  mode: "new" | "edit";
  size?: "xs" | "sm" | "md" | "lg";
};

type Inputs = {
  staff: string;
  processNumber: string;
  productId: string;
  itemName: string;
  quantity: number;
  scheduledAt: string;
  initData: {};
};

export const ScheduleModal: FC<Props> = ({ title, mode, size = "md" }) => {
  const products = useProductsStore((state) => state.products);
  const users = useAuthStore((state) => state.users);
  const [filterUsers, setFilterUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    await addSchedule(data);
    reset();
    onClose();
  };

  const addSchedule = async (data: Inputs) => {
    const userRef = doc(db, "users", data.staff);
    const productRef = doc(db, "products", data.productId);
    const uuid = uuidv4();
    const scheduleRef = doc(db, "cuttingSchedules", uuid);
    try {
      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) {
          throw "生地が登録されていません。";
        }
        transaction.update(productRef, {
          cuttingSchedules: arrayUnion(uuid),
        });

        transaction.set(scheduleRef, {
          staff: data.staff,
          userRef: userRef,
          processNumber: data.processNumber,
          productId: data.productId,
          productRef: productRef,
          itemName: data.itemName,
          quantity: Number(data.quantity) || 0,
          scheduledAt: data.scheduledAt,
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setFilterUsers(users.filter((user) => user.sales === true));
  }, [users]);

  return (
    <>
      <Button
        colorScheme={mode === "new" ? "facebook" : "gray"}
        size={size}
        onClick={onOpen}
      >
        {title}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>{title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={6}>
                <Box>
                  <Text mb="8px">担当者</Text>
                  <Select
                    placeholder="担当者の選択"
                    {...register("staff", { required: true })}
                  >
                    {filterUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Text mb="8px">加工指示書NO.</Text>
                  <Input placeholder="" {...register("processNumber")} />
                </Box>
                <Box>
                  <Text mb="8px">生地品番</Text>
                  <Select
                    placeholder="生地選択"
                    disabled={mode === "edit" ? true : false}
                    {...register("productId", { required: true })}
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.productNumber} {product.colorName}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Text mb="8px">アイテム名</Text>
                  <Input
                    placeholder=""
                    {...register("itemName", { required: true })}
                  />
                </Box>
                <Flex gap={3}>
                  <Box>
                    <Text mb="8px">使用予定（m）</Text>
                    <NumberInput
                      w="150px"
                      {...register("quantity")}
                      min={0}
                      max={100000}
                      onChange={() => getValues}
                    >
                      <NumberInputField textAlign="right" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box flexGrow={1}>
                    <Text mb="8px">納期</Text>
                    <Input
                      type="date"
                      placeholder=""
                      {...register("scheduledAt", { required: true })}
                    />
                  </Box>
                </Flex>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Flex gap={3}>
                <Button variant="outline" onClick={onClose}>
                  閉じる
                </Button>
                <Button colorScheme="facebook" type="submit">
                  {mode === "new" ? "登録" : "編集"}
                </Button>
              </Flex>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
