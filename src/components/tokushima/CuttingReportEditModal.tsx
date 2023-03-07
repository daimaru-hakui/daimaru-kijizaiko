import {
  Box,
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
import { CuttingReportType } from "../../../types/CuttingReportType";
import CuttingReportInputArea from "./CuttingReportInputArea";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import useSWR from "swr";

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
  const { isAuths } = useAuthManagement();
  const { data, mutate } = useSWR(`/api/cutting-reports/${startDay}/${endDay}`);
  mutate({ ...data });
  return (
    <>
      {isAuths(["tokushima", "rd"]) && (
        <Button
          size="xs"
          variant="outline"
          colorScheme="facebook"
          onClick={onOpen}
        >
          編集
        </Button>
      )}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          mutate({ ...data });
        }}
        size="3xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>裁断報告書</ModalHeader>
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
