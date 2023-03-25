import {
  Box,
  Button,
  Flex,
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
import { CuttingReportType } from "../../../types";
import CuttingReportInputArea from "./CuttingReportInputArea";

type Props = {
  report: CuttingReportType;
  startDay: string;
  endDay: string;
};

const CuttingReportEditModal: NextPage<Props> = ({
  report,
  startDay,
  endDay,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        colorScheme="facebook"
        onClick={onOpen}
      >
        編集
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex gap={3} alignItems="center">
              <Box>裁断報告書</Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CuttingReportInputArea
              title="編集"
              pageType="edit"
              report={report}
              onClose={onClose}
              startDay={startDay}
              endDay={endDay}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CuttingReportEditModal;
