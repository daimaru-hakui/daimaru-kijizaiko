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
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuthStore, useProductsStore } from "../../../store";
import { CuttingSchedule } from "../../../types";
import { FaEdit } from "react-icons/fa";
import { useCuttingSchedules } from "../../hooks/useCuttingSchedules";

type Props = {
  title: string;
  mode: "new" | "edit";
  size?: "xs" | "sm" | "md" | "lg";
  initData?: CuttingSchedule;
};

type Inputs = {
  id: string;
  staff: string;
  processNumber: string;
  productId: string;
  itemName: string;
  quantity: number;
  scheduledAt: string;
};

export const ScheduleModal: FC<Props> = ({
  title,
  mode,
  size = "md",
  initData = {},
}) => {
  const products = useProductsStore((state) => state.products);
  const users = useAuthStore((state) => state.users);
  const [filterUsers, setFilterUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {addSchedule,updateSchedule} = useCuttingSchedules()
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: initData,
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (mode === "new") {
      await addSchedule(data);
    }
    if (mode === "edit") {
      await updateSchedule(data);
    }
    onClose();
  };

  useEffect(() => {
    setFilterUsers(users.filter((user) => user.sales === true));
  }, [users]);

  return (
    <>
      {mode === "new" ? (
        <Button
          colorScheme="facebook"
          size={size}
          onClick={onOpen}
        >
          {title}
        </Button>
      ) : (
        <FaEdit cursor="pointer" onClick={onOpen} />
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          reset();
        }}
        size="md"
      >
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
                    <Text mb="8px">製品納期</Text>
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
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    reset();
                  }}
                >
                  閉じる
                </Button>
                <Button colorScheme="facebook" type="submit">
                  {mode === "new" ? "登録" : "更新"}
                </Button>
              </Flex>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
