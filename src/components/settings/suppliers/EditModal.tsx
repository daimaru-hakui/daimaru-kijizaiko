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
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { db } from "../../../../firebase";
import { SupplierType } from "../../../../types/SupplierType";
import { UseInputSettings } from "../../../hooks/UseInputSettings";

type Props = {
  supplier: SupplierType;
};

const EditModal: NextPage<Props> = ({ supplier }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { items, setItems, handleInputChange } = UseInputSettings()

  useEffect(() => {
    setItems(supplier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier]);

  const updateSupplier = async () => {
    const result = window.confirm("変更して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "suppliers", `${supplier.id}`);
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
    setItems({ ...supplier });
    onClose();
  };

  return (
    <>
      <FaEdit cursor="pointer" size="20px" onClick={onOpen} />
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
            <Button colorScheme="facebook" onClick={updateSupplier}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditModal;
