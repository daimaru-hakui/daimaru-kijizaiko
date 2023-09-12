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
import { FaEdit } from "react-icons/fa";
import { GrayFabric } from "../../../types";
import { GrayFabricForm } from "./GrayFabricForm";

type Props = {
  grayFabric: GrayFabric;
};

export const GrayFabricEditModal: FC<Props> = ({ grayFabric }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <FaEdit color="#444" cursor="pointer" onClick={onOpen} />
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>キバタ詳細</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <GrayFabricForm
              title="キバタの更新"
              grayFabric={grayFabric}
              toggleSwitch="edit"
              onClose={onClose}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>閉じる</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GrayFabricEditModal;
