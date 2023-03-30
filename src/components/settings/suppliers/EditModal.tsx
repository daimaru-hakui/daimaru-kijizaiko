import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { FaEdit } from "react-icons/fa";
import { db } from "../../../../firebase";
import { SupplierType } from "../../../../types";
import { SupplierInputArea } from "./SupplierInputArea";

type Props = {
  supplier: SupplierType;
};

const EditModal: NextPage<Props> = ({ supplier }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const updateSupplier = async (data: SupplierType) => {
    const result = window.confirm("変更して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "suppliers", `${supplier.id}`);
    try {
      await updateDoc(docRef, {
        name: data.name || "",
        kana: data.kana || "",
        comment: data.comment || "",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  const onReset = () => {
    onClose();
  };

  return (
    <>
      <FaEdit color="#444" cursor="pointer" onClick={onOpen} />
      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p={6}>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SupplierInputArea
              type="edit"
              supplier={supplier}
              updateSupplier={updateSupplier}
            />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={onReset}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditModal;
