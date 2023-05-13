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
import { useEffect, FC } from "react";
import { FaEdit } from "react-icons/fa";
import { History } from "../../../types";
import { useFabricDyeing } from "../../hooks/products/useFabricDyeing";

type Props = {
  history: History;
  type: string;
  onClick: Function;
  items: any;
  setItems: Function;
  orderType?: string;
};

export const HistoryEditModal: FC<Props> = ({
  history,
  type,
  onClick,
  items,
  setItems,
  orderType,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    deleteFabricDyeingOrderStock,
    deleteFabricDyeingOrderRanning,
    updateFabricDyeingOrderStock,
    updateFabricDyeingOrderRanning,
    confirmProcessingFabricDyeing
  } = useFabricDyeing();

  // 初期値をitemsに代入
  useEffect(() => {
    setItems({ ...history });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: value });
  };

  const inputReset = () => {
    setItems({ ...history });
  };

  return (
    <>
      <FaEdit color="#444" cursor="pointer" onClick={onOpen} />
      <Modal
        isOpen={isOpen}
        onClose={() => {
          inputReset();
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <Box>
                <Box>品番</Box>
                <Flex gap={1}>
                  <Box>{history?.productNumber}</Box>
                  {history?.colorName && <Box>{history?.colorName}</Box>}
                  <Box>{history?.productName}</Box>
                </Flex>
              </Box>
              <Box w="100%">
                <Text>数量（m）</Text>
                <NumberInput
                  mt={1}
                  name="quantity"
                  defaultValue={0}
                  min={0}
                  max={10000}
                  value={items?.quantity}
                  onChange={(e) => handleNumberChange(e, "quantity")}
                >
                  <NumberInputField textAlign="right" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              {items?.price && (
                <Box w="100%">
                  <Text>金額（円）</Text>
                  <NumberInput
                    mt={1}
                    name="price"
                    defaultValue={0}
                    min={0}
                    max={10000}
                    value={items?.price === 0 ? "" : items?.price}
                    onChange={(e) => handleNumberChange(e, "price")}
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
                  name="orderedAt"
                  value={items?.orderedAt}
                  onChange={handleInputChange}
                />
              </Box>
              {type === "order" && (
                <Box w="100%">
                  <Text>
                    {orderType === "purchase" ? "入荷予定" : "仕上予定日"}
                  </Text>
                  <Input
                    type="date"
                    mt={1}
                    name="scheduledAt"
                    value={items?.scheduledAt}
                    onChange={handleInputChange}
                  />
                </Box>
              )}
              {type === "confirm" && (
                <Box w="100%">
                  <Text>仕上日</Text>
                  <Input
                    type="date"
                    mt={1}
                    name="fixedAt"
                    value={items?.fixedAt}
                    onChange={handleInputChange}
                  />
                </Box>
              )}
              <Box w="100%">
                <Text>コメント</Text>
                <Textarea
                  mt={1}
                  name="comment"
                  value={items?.comment}
                  onChange={handleInputChange}
                />
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                inputReset();
                onClose();
              }}
            >
              閉じる
            </Button>

            <Button
              colorScheme="blue"
              onClick={() => {
                onClick();
                onClose();
              }}
            >
              更新
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
