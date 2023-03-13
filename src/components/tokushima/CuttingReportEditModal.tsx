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
import { CuttingReportType } from "../../../types/CuttingReportType";
import CuttingReportInputArea from "./CuttingReportInputArea";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import useSWRImmutable from "swr/immutable";

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
  const { data, mutate } = useSWRImmutable(`/api/cutting-reports/${startDay}/${endDay}`);

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
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                onClose();
                mutate({ ...data });
              }}
            >
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CuttingReportEditModal;
