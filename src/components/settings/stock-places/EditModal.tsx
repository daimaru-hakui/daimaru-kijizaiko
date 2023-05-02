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
import { FC } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { FaEdit } from "react-icons/fa";
import { db } from "../../../../firebase";
import { StockPlace } from "../../../../types";
import { StockPlaceInputArea } from "./StockPlaceInputArea";
import { useAuthStore } from "../../../../store";

type Props = {
  stockPlace: StockPlace;
};

export const EditModal: FC<Props> = ({ stockPlace }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useAuthStore((state) => state.currentUser);

  const updateStockPlace = async (data: StockPlace) => {
    const result = window.confirm("変更して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "stockPlaces", `${stockPlace.id}`);
    try {
      await updateDoc(docRef, {
        name: data.name || "",
        kana: data.kana || "",
        address: data.address || "",
        tel: data.tel || "",
        fax: data.fax || "",
        comment: data.comment || "",
        updateUser: currentUser || "",
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
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <StockPlaceInputArea
              type="edit"
              stockPlace={stockPlace}
              updateStockPlace={updateStockPlace}
            />
          </ModalBody>
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={onReset}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
