import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { useInputHandle } from "../../hooks/UseInputHandle";

type Props = {
  title: string;
  collectionName: string;
};

type ArrayType = {
  id: string;
  name: string;
};

const SettingAddModal: NextPage<Props> = ({ title, collectionName }) => {
  const [array, setArray] = useState([{}] as ArrayType[]);
  const { items, setItems, handleInputChange } = useInputHandle();
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const getArray = async () => {
      const docsRef = collection(db, collectionName);
      const querysnap = await getDocs(docsRef);
      setArray(
        querysnap.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as ArrayType)
        )
      );
    };
    getArray();
  }, [collectionName]);

  // 追加
  const addFunc = async () => {
    const collectionRef = collection(db, `${collectionName}`);
    setFlag(false);
    await addDoc(collectionRef, {
      name: items.name,
    });
    setItems({ name: "" });
  };

  // 登録しているかのチェック
  useEffect(() => {
    let name = items.name;
    if (!name) name = "noValue";
    const base = array?.map((a: { name: string }) => a.name);
    const result = base?.includes(name);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen}>Open Modal</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody></ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SettingAddModal;
