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
import { db } from "../../../../firebase";
import { MaterialNameType } from "../../../../types/MaterialNameType";

type Props = {
  data: MaterialNameType;
};

const MaterialEditModal: NextPage<Props> = ({ data }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState<MaterialNameType>();

  useEffect(() => {
    setItems({ ...data } as MaterialNameType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const updateDocEdit = async () => {
    const docRef = doc(db, 'materialNames', `${data.id}`);
    await updateDoc(docRef, {
      name: items?.name,
    });
  };

  const reset = () => {
    setItems(data);
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
              onChange={(e) => setItems({ ...items, name: e.target.value })}
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

export default MaterialEditModal;
