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
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentUserState, loadingState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";
import { useGrayFabricFunc } from "../../hooks/UseGrayFabricFunc";
import GrayFabricInputArea from "./GrayFabricInputArea";

type Props = {
  grayFabric: GrayFabricType;
};

const GrayFabricEditModal: NextPage<Props> = ({ grayFabric }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <FaEdit cursor="pointer" size="20px" onClick={onOpen} />
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>キバタ詳細</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <GrayFabricInputArea
              title="キバタの更新"
              grayFabric={grayFabric}
              toggleSwitch='edit'
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
