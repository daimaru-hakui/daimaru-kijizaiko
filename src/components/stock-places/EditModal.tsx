import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";

type Props = {
  stockPlace: {
    id: string;
    name: string;
    kana: string;
    comment: string;
  };
};

const EditModal: NextPage<Props> = ({ stockPlace }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState<any>({});
  // const [supplier, setSupplier] = useState<any>();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  useEffect(() => {
    setItems(stockPlace);
  }, [stockPlace]);

  const updateStockPlace = async () => {
    const result = window.confirm("変更して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "stockPlaces", `${stockPlace.id}`);
    try {
      await updateDoc(docRef, {
        name: items.name || "",
        kana: items.kana || "",
        comment: items.comment || "",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  const reset = () => {
    setItems({ ...stockPlace });
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen}>編集</Button>

      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Text>仕入先名</Text>
              <Input
                name="name"
                value={items?.name}
                onChange={handleInputChange}
              />
              <Text>フリガナ</Text>
              <Input
                name="kana"
                value={items?.kana}
                onChange={handleInputChange}
              />
              <Text>備考</Text>
              <Textarea
                name="comment"
                value={items?.comment}
                onChange={handleInputChange}
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={reset}>
              Close
            </Button>
            <Button colorScheme="facebook" onClick={updateStockPlace}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditModal;
