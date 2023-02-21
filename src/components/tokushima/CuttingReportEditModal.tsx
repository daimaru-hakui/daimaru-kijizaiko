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
import { FaEdit } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { CuttingReportType } from "../../../types/CuttingReportType";
import CuttingReportInputArea from "./CuttingReportInputArea";
import { useAuthManagement } from "../../hooks/UseAuthManagement";

type Props = {
  reportId: string;
};

const CuttingReportEditModal: NextPage<Props> = ({ reportId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [report, setReport] = useState({} as CuttingReportType);
  const { isAuths } = useAuthManagement();

  useEffect(() => {
    const getCuttingReport = async () => {
      const docRef = doc(db, "cuttingReports", reportId);
      const docSnap = await getDoc(docRef);
      setReport({ ...docSnap.data(), id: docSnap.id } as CuttingReportType);
    };
    getCuttingReport();
  }, [isOpen, reportId]);

  return (
    <>
      {/* <FaEdit onClick={onOpen} cursor="pointer" /> */}
      {isAuths(["tokushima", "rd"]) && (
        <Button size="xs" variant="outline" onClick={onOpen}>
          編集
        </Button>
      )}
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
