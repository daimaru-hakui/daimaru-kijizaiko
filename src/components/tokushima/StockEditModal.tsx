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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
} from "@chakra-ui/react";
import { useState, useEffect, FC } from "react";
import useSWR from "swr";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useSetRecoilState } from "recoil";
import { loadingState } from "../../../store";
import { FaEdit } from "react-icons/fa";

type Props = {
  productId: string;
};

export const StockEditModal: FC<Props> = ({ productId }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const setLoading = useSetRecoilState(loadingState);
  const { data } = useSWR(`/api/products/${productId}`);
  const [stock, setStock] = useState(null);

  useEffect(() => {
    setStock(data?.content?.tokushimaStock);
  }, [data?.content?.tokushimaStock]);

  const updateProduct = async () => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const docRef = doc(db, "products", `${productId}`);
    try {
      await updateDoc(docRef, {
        tokushimaStock: Number(stock),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const onReset = () => {
    setStock(0);
  };
  return (
    <>
      <Box ml={2} mt={1}>
        <FaEdit cursor="pointer" onClick={onOpen} />
      </Box>
      <Modal size="xs" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>在庫数量を編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <NumberInput
              value={stock || data?.content?.tokushimaStock}
              onChange={(e) => setStock(e)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                onReset();
                onClose();
              }}
            >
              閉じる
            </Button>
            <Button colorScheme="blue" onClick={updateProduct}>
              更新
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
