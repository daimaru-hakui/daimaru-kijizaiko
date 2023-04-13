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
import { useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { currentUserState } from "../../../../store";
import { LocationType } from "../../../../types";
import { LocationInputArea } from "./LocationInputArea";

type Props = {
  location: LocationType;
};

export const EditLocationModal: FC<Props> = ({ location }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useRecoilValue(currentUserState);

  const updateLocation = async (data: LocationType) => {
    const result = window.confirm("変更して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "locations", `${location.id}`);
    try {
      await updateDoc(docRef, {
        name: data.name || "",
        order: Number(data.order) || 0,
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
            <LocationInputArea
              type="edit"
              location={location}
              updateLocation={updateLocation}
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
