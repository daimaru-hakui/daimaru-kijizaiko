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
import { FC } from "react";
import { GrayFabric } from "../../../types";
import { useGrayFabrics } from "../../hooks/useGrayFabrics";
import { useForm, SubmitHandler } from "react-hook-form";

type Props = {
  grayFabric: GrayFabric;
};

type Inputs = {
  quantity: number,
  price: number,
  orderedAt: string;
  scheduledAt: string;
  fixedAt: string;
  comment: string;
};

export const GrayFabricOrderAreaModal: FC<Props> = ({ grayFabric }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { orderGrayFabric } = useGrayFabrics();
  const { register, handleSubmit, getValues, reset, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      orderedAt: "",
      scheduledAt: "",
      quantity: 0,
      comment: "",
    }
  });

  const onSubmit: SubmitHandler<Inputs> = data => {
    if (data.quantity === 0) {
      window.alert('数量を入力してください。');
      return;
    };
    orderGrayFabric(data, grayFabric);
    reset();
    onClose();
  };

  return (
    <>
      <Button colorScheme="facebook" size="xs" onClick={onOpen}>
        発注
      </Button>
      <Modal
        size="xl"
        isOpen={isOpen}
        onClose={() => {
          onClose();
          reset();
        }} >
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                  w="full"
                  direction={{ base: "column", md: "row" }}
                >
                  <Box w="100%">
                    <Box>発注日</Box>
                    <Input
                      mt={1}
                      type="date"
                      {...register("orderedAt")}
                    />
                  </Box>
                  <Box w="100%">
                    <Box>予定日</Box>
                    <Input
                      mt={1}
                      type="date"
                      {...register("scheduledAt")}
                    />
                  </Box>

                  <Box w="100%">
                    <Text>数量（m）</Text>
                    <NumberInput
                      mt={1}
                      w="100%"
                      {...register("quantity", { required: true })}
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
                </Flex>
                <Box w="100%">
                  <Text>備考</Text>
                  <Textarea
                    mt={1}
                    {...register("comment")}
                  />
                </Box>
                <Button
                  type="submit"
                  colorScheme="facebook"
                >
                  登録する
                </Button>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button onClick={() => {
                onClose();
                reset();
              }}>閉じる</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal >
    </>
  );
};
