import {
  Box,
  Button,
  Flex,
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
  useDisclosure,
} from "@chakra-ui/react";
import { FC } from "react";
import { History } from "../../../types";
import { useAccounting } from "../../hooks/accounting/useAccounting";
import { useForm, SubmitHandler } from "react-hook-form";

type Props = {
  history: History;
  startDay: string;
  endDay: string;
};

type Inputs = {
  quantity: number,
  price: number,
  orderedAt: string;
  fixedAt: string;
  comment: string;
};

export const AccountingOrderToConfirmModal: FC<Props> = ({ history, startDay, endDay }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { confirmProcessingAccounting } = useAccounting(startDay, endDay);
  const { register, handleSubmit, getValues, reset, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      ...history
    }
  });

  const onSubmit: SubmitHandler<Inputs> = data => {
    confirmProcessingAccounting(history, data);
    onClose();
  };

  return (
    <>
      <Button
        size="xs"
        colorScheme="facebook"
        onClick={() => {
          onOpen();
        }}
      >
        金額確定
      </Button>

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
            <ModalHeader>確定処理</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={6}>
                <Flex gap={3}>
                  <Box>品　　番</Box>
                  <Flex gap={1}>
                    <Box>{history.productNumber}</Box>
                    <Box>{history.productName}</Box>
                  </Flex>
                </Flex>

                <Box>
                  <>
                    <Box w="100%">
                      <Text>入荷数量（ｍ）</Text>
                      <NumberInput
                        mt={1}
                        name="quantity"
                        defaultValue={0}
                        {...register('quantity')}
                        min={0}
                        max={100000}
                        onChange={getValues}
                      >
                        <NumberInputField textAlign="right" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Box>
                    <Box w="100%" mt={3}>
                      <Text>単価（円）</Text>
                      <NumberInput
                        mt={1}
                        name="price"
                        defaultValue={0}
                        {...register('price')}
                        min={0}
                        max={100000}
                        onChange={getValues}
                      >
                        <NumberInputField textAlign="right" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Box>
                  </>
                </Box>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <>
                <Button
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
                  colorScheme="facebook"
                >
                  確定
                </Button>
              </>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
