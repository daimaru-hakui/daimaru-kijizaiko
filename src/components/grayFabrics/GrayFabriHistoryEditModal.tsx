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
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { FC } from "react";
import { FaEdit } from "react-icons/fa";
import { useForm, SubmitHandler } from "react-hook-form";
import { useGrayFabrics } from "../../hooks/useGrayFabrics";
import { GrayFabricHistory } from "../../../types";

type Props = {
  history: GrayFabricHistory;
  type: string;
  startDay?: string;
  endDay?: string;
};

type Inputs = {
  quantity: number;
  price: number;
  orderedAt: string;
  scheduledAt: string;
  fixedAt: string;
  comment: string;
};

export const GrayFabricHistoryEditModal: FC<Props> = ({ history, type, startDay, endDay }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { updateOrderHistory, updateConfirmHistory } = useGrayFabrics(startDay, endDay);
  const { register, handleSubmit, getValues, reset, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      ...history
    }
  });

  const onSubmit: SubmitHandler<Inputs> = data => {
    if (type === 'order') {
      updateOrderHistory(history, data);
    }
    if (type === 'confirm') {
      updateConfirmHistory(history, data);
    }
    onClose();
  };

  return (
    <>
      <FaEdit cursor="pointer" onClick={onOpen} />
      <Modal
        isOpen={isOpen}
        onClose={() => {
          reset();
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>編集</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={6}>
                <Box>
                  <Box>品番</Box>
                  <Flex gap={1}>
                    <Box>{history.productNumber}</Box>
                    <Box>{history.productName}</Box>
                  </Flex>
                </Box>
                <Box w="100%">
                  <Text>数量（m）</Text>
                  <NumberInput
                    mt={1}
                    defaultValue={0}
                    {...register("quantity")}
                    min={0}
                    max={10000}
                    onChange={getValues}
                  >
                    <NumberInputField textAlign="right" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>
                {history?.price && (
                  <Box w="100%">
                    <Text>金額（円）</Text>
                    <NumberInput
                      mt={1}
                      defaultValue={0}
                      {...register("price")}
                      min={0}
                      max={10000}
                      onChange={getValues}
                    >
                      <NumberInputField textAlign="right" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                )}
                <Box w="100%">
                  <Text>発注日</Text>
                  <Input
                    type="date"
                    mt={1}
                    {...register("orderedAt")}
                  />
                </Box>
                {history?.scheduledAt && (
                  <Box w="100%">
                    <Text>予定納期</Text>
                    <Input
                      type="date"
                      mt={1}
                      {...register("scheduledAt")}
                    />
                  </Box>
                )}
                {history?.fixedAt && (
                  <Box w="100%">
                    <Text>仕上日</Text>
                    <Input
                      type="date"
                      mt={1}
                      {...register("fixedAt")}
                    />
                  </Box>
                )}
                <Box w="100%">
                  <Text>コメント</Text>
                  <Textarea
                    mt={1}
                    {...register("comment")}
                  />
                </Box>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                閉じる
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
              >
                更新
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal >
    </>
  );
};
