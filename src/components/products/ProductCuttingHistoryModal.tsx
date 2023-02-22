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
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../firebase";
import { CuttingProductType } from "../../../types/CuttingProductType";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { CuttingReportType } from "../../../types/CuttingReportType";

type Props = {
  productId: string;
};

const ProductCuttingHistoryModal: NextPage<Props> = ({ productId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cuttingReports, setCuttingReports] = useState(
    [] as CuttingReportType[]
  );
  const {
    getUserName,
    getSerialNumber,
    getProductNumber,
    getColorName,
    getProductName,
  } = useGetDisp();

  useEffect(() => {
    const getCuttingReports = async () => {
      const q = query(
        collection(db, "cuttingReports"),
        orderBy("serialNumber", "desc")
      );
      const snapShot = await getDocs(q);
      setCuttingReports(
        snapShot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType))
          .map((cuttingReport: any) =>
            cuttingReport.products.map((product: CuttingProductType) => ({
              ...cuttingReport,
              ...product,
            }))
          )
          .flat()
          .filter((doc: { productId: string }) => doc.productId === productId)
      );
    };
    getCuttingReports();
  }, [productId]);
  return (
    <>
      <Button
        size="xs"
        variant="outline"
        colorScheme="facebook"
        onClick={onOpen}
      >
        裁断履歴
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>裁断履歴</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={3}>
              <Text>{getProductNumber(productId)}</Text>
              <Text>{getColorName(productId)}</Text>
              <Text>{getProductName(productId)}</Text>
            </Flex>
            {cuttingReports.length ? (
              <TableContainer mt={6}>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>裁断日</Th>
                      <Th>裁断報告書NO</Th>
                      <Th>加工指示書NO</Th>
                      <Th>商品</Th>
                      <Th>受注先名</Th>
                      <Th>担当社</Th>
                      <Th>裁断数量</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <>
                      {cuttingReports.map(
                        (
                          report: CuttingReportType & { quantity: string },
                          index
                        ) => (
                          <Tr key={index}>
                            <Td>{report?.cuttingDate}</Td>
                            <Td>{getSerialNumber(report?.serialNumber)}</Td>
                            <Td>{report?.processNumber}</Td>
                            <Td>{report?.itemName}</Td>
                            <Td>{report?.client}</Td>
                            <Td>{getUserName(report?.staff)}</Td>
                            <Td isNumeric>{report?.quantity || 0}m</Td>
                          </Tr>
                        )
                      )}
                    </>
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Flex mt={6} justifyContent="center">
                <Box>裁断履歴はありません。</Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductCuttingHistoryModal;
