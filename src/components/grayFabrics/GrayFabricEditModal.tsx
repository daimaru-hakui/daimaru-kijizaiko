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
import { GrayFabricType } from "../../../types";
import { GrayFabricInputArea } from "./GrayFabricInputArea";

type Props = {
  grayFabric: GrayFabricType;
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
            <GrayFabricInputArea
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
