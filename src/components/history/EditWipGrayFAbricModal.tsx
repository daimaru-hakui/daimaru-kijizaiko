import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Stack,
  Box,
  Flex,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { FaEdit } from "react-icons/fa";
import { useState } from "react";

type Props = {
  history: any;
};
const EditWipGrayFAbricModal: NextPage<Props> = ({ history }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState({
    quantity: 0,
    date: "",
    comment: "",
    stockPlaceType: 1,
  });

  const handleNumberChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };
  return (
    <>
      <FaEdit cursor="pointer" onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <Box>品番</Box>
              <Flex gap={1}>
                <Box>{history.productNumber}</Box>
                <Box>{history.colorName}</Box>
                <Box>{history.productName}</Box>
              </Flex>
              <Box w="100%">
                <Text>数量（m）</Text>
                <NumberInput
                  mt={1}
                  w="100%"
                  name="quantity"
                  defaultValue={0}
                  min={0}
                  max={10000}
                  onChange={(e) => handleNumberChange(e, "quantity")}
                >
                  <NumberInputField textAlign="right" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              閉じる
            </Button>
            <Button colorScheme="blue">更新</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default EditWipGrayFAbricModal;
