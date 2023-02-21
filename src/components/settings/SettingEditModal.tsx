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
  useDisclosure,
} from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { db } from "../../../firebase";
import { StockPlaceType } from "../../../types/StockPlaceType";
import { UseInputSetting } from "../../hooks/UseInputSetting";

type Props = {
  obj: StockPlaceType;
  collectionName: string;
};

const SettingEditModal: NextPage<Props> = ({ obj, collectionName }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { items, setItems, handleInputChange } = UseInputSetting();

  useEffect(() => {
    setItems({ ...obj });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obj]);

  const updateDocEdit = async () => {
    const docRef = doc(db, `${collectionName}`, `${obj.id}`);
    await updateDoc(docRef, {
      name: items.name,
    });
  };

  const reset = () => {
    setItems(obj);
  };

  return (
    <>
      <FaEdit color="#444" cursor="pointer" onClick={onOpen} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="text"
              name="name"
              value={items?.name}
              onChange={handleInputChange}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              variant="ghost"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Close
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                updateDocEdit();
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

export default SettingEditModal;
