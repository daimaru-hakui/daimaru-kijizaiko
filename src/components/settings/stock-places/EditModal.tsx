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
import { useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { currentUserState } from "../../../../store";
import { StockPlaceType } from "../../../../types";
import { StockPlaceInputArea } from "./StockPlaceInputArea";

type Props = {
  stockPlace: StockPlaceType;
};

const EditModal: NextPage<Props> = ({ stockPlace }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useRecoilValue(currentUserState);

  const updateStockPlace = async (data: StockPlaceType) => {
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

export default EditModal;
