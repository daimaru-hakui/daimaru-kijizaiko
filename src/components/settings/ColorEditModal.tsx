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
import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";

type Props = {
  color: {
    id: string;
    name: string;
  };
};

const ColorEditModal: NextPage<Props> = ({ color }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState<any>();
  useEffect(() => {
    setItems(color);
  }, [color]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const updateColor = async () => {
    const colorsRef = doc(db, "colors", `${color.id}`);
    await updateDoc(colorsRef, {
      name: items.name,
    });
    onClose();
  };

  const reset = () => {
    setItems(color);
  };

  return (
    <>
      <Button mr={3} onClick={onOpen}>
        編集
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="text"
              name="name"
              value={items.name}
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
            <Button colorScheme="blue" onClick={updateColor}>
              更新
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ColorEditModal;
