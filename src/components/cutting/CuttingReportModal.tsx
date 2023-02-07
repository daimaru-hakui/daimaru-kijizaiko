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
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NextPage } from "next";
import React from "react";
import { useRecoilValue } from "recoil";
import { getSerialNumber } from "../../../functions";
import { productsState } from "../../../store";
import { CuttingProductType } from "../../../types/CuttingProductType";
import { CuttingReportType } from "../../../types/CuttingReportType";
import { ProductType } from "../../../types/productType";

type Props = {
  report: CuttingReportType;
};

const CuttingReportModal: NextPage<Props> = ({ report }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const products = useRecoilValue(productsState);

  const getProductNumber = (products: ProductType[], productId: string) => {
    const result = products.find((product) => product.id === productId);
    return `${result?.productNumber} ${result?.colorName} ${result?.productName}`;
  };
  return (
    <>
      <Button
        size="xs"
        mt={1}
        variant="outline"
        colorScheme="facebook"
        onClick={onOpen}
      >
        詳細
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>裁断報告書</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <Flex gap={6}>
                <Box>
                  <Text fontWeight="bold">裁断報告書</Text>
                  <Box>No.{getSerialNumber(report.serialNumber)}</Box>
                </Box>
                <Box>
                  <Text fontWeight="bold">裁断日</Text>
                  <Box>{report.cuttingDay}</Box>
                </Box>
              </Flex>
              <Flex gap={6}>
                <Box>
                  <Text fontWeight="bold">加工指示書</Text>
                  <Box>No.{report.processNumber}</Box>
                </Box>
                <Box>
                  <Text fontWeight="bold">受注先名</Text>
                  <Box>{report.client}</Box>
                </Box>
              </Flex>
              <Flex gap={6}>
                <Box>
                  <Text fontWeight="bold">種別</Text>
                  <Box>{report.itemType === "1" ? "既製" : "別注"}</Box>
                </Box>
                <Box>
                  <Text fontWeight="bold">品名</Text>
                  <Box>{report.itemName}</Box>
                </Box>
                <Box>
                  <Text fontWeight="bold">枚数</Text>
                  <Box textAlign="right">{report.totalQuantity}</Box>
                </Box>
              </Flex>
              <Box>
                {report.products.map((product: any) => (
                  <Flex key={product.productId} gap={3}>
                    <Box>{product.category}</Box>
                    <Box>{getProductNumber(products, product.productId)}</Box>
                    <Box>{product.quantity}m</Box>
                  </Flex>
                ))}
              </Box>
            </Stack>
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

export default CuttingReportModal;
