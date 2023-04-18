import {
  Box,
  Button,
  CheckboxGroup,
  Container,
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
import { FC } from "react";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { ProductCuttingHistoryModal } from "./ProductCuttingHistoryModal";
import { ProductPurchaseHistoryModal } from "./ProductPurchaseHistoryModal";
import { ProductEditModal } from "./ProductEditModal";
import { ProductType } from "../../../types";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
  title?: string;
  productId?: string;
  product?: ProductType;
};

export const ProductModal: FC<Props> = ({ title = "詳細", product }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const productId = product?.id;

  const {
    getUserName,
    getSupplierName,
    getMixed,
    getFabricStd,
    getGrayFabricName,
    getGrayFabricNumber,
    getLocation,
  } = useGetDisp();

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        colorScheme="facebook"
        onClick={onOpen}
      >
        {title}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex gap={3} alignItems="center">
              生地詳細
              <ProductEditModal product={product} type="button" />
              {/* <ProductCuttingHistoryModal productId={productId} type="button" />
              <ProductPurchaseHistoryModal
                productId={productId}
                type="button"
              /> */}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Container maxW="800px" p={6} bg="white" rounded="md">
              <Stack spacing={6} mt={6}>
                <Box p={2} bg="#f4f4f4" textAlign="center">
                  {product?.productType === 1 ? "既製品" : "別注品"}
                </Box>
                {product?.productType === 2 && (
                  <Box>
                    <Text fontWeight="bold">担当者</Text>
                    <Box>{getUserName(product?.staff)}</Box>
                  </Box>
                )}
                <Flex gap={6}>
                  <Box w="100%">
                    <Text fontWeight="bold">仕入先</Text>
                    <Box>{getSupplierName(product?.supplierId)}</Box>
                  </Box>
                </Flex>

                <Flex
                  w="100%"
                  gap={3}
                  justifyContent="flex-start"
                  flexDirection={{ base: "column", md: "row" }}
                >
                  <Box w="100%" minW="120px" flex="1">
                    <Text fontWeight="bold">品番</Text>
                    <Box>{product?.productNum}</Box>
                  </Box>
                  <Box w="100%" minW="120px" flex="1">
                    <Text fontWeight="bold">色番</Text>
                    <Box>{product?.colorNum}</Box>
                  </Box>
                  <Box w="100%" minW="120px" flex="1">
                    <Text fontWeight="bold">色</Text>
                    <Box>{product?.colorName}</Box>
                  </Box>
                </Flex>
                <Box w="100%">
                  <Text fontWeight="bold">品名</Text>
                  <Box>{product?.productName}</Box>
                </Box>
                <Box w="100%">
                  <Text fontWeight="bold">単価</Text>
                  <Box>{product?.price}円</Box>
                </Box>
                {product?.locations?.length > 0 && (
                  <Box w="100%">
                    <Text fontWeight="bold">徳島保管場所</Text>
                    <Flex gap={3}>
                      {product.locations?.map((location, index) => (
                        <Box key={index}>{getLocation(location)}</Box>
                      ))}
                    </Flex>
                  </Box>
                )}

                {product?.grayFabricId && (
                  <Box flex={1} w="100%">
                    <Text fontWeight="bold">使用キバタ</Text>
                    <Flex gap={3} mt={1}>
                      <Box> {getGrayFabricNumber(product?.grayFabricId)}</Box>
                      <Box> {getGrayFabricName(product?.grayFabricId)}</Box>
                    </Flex>
                  </Box>
                )}
                {product?.noteProduct && (
                  <>
                    <Box flex={1} w="100%">
                      <Text fontWeight="bold">備考（使用製品品番）</Text>
                      <Box
                        mt={1}
                        p={3}
                        rounded="md"
                        border="1px"
                        borderColor="gray.100"
                        whiteSpace="pre-wrap"
                      >
                        {product?.noteProduct}
                      </Box>
                    </Box>
                  </>
                )}
                <Flex
                  gap={6}
                  w="100%"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  flexDirection={{ base: "column", md: "row" }}
                >
                  <Stack spacing={6} flex={1} w="100%">
                    {product?.materialName && (
                      <Box w="100%">
                        <Text fontWeight="bold">組織名</Text>
                        {product?.materialName}
                      </Box>
                    )}
                    {product?.fabricWidth && (
                      <Box w="100%">
                        <Text fontWeight="bold">規格</Text>
                        <Flex>
                          {getFabricStd(
                            product?.fabricWidth,
                            product?.fabricLength,
                            product?.fabricWeight
                          )}
                        </Flex>
                      </Box>
                    )}
                  </Stack>
                  <Flex flex={1} gap={6} w="100%">
                    {Object.keys(product?.materials).length > 0 && (
                      <Box w="100%">
                        <Text fontWeight="bold">混率</Text>
                        <Box
                          mt={1}
                          p={3}
                          rounded="md"
                          border="1px"
                          borderColor="gray.100"
                        >
                          <Stack spacing={3} w="100%">
                            {getMixed(product.materials).map(
                              (material, index) => (
                                <Text key={index}>{material}</Text>
                              )
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    )}
                  </Flex>
                </Flex>
                {product?.features?.length > 0 && (
                  <Box w="100%">
                    <Text fontWeight="bold">機能性</Text>
                    <CheckboxGroup colorScheme="green">
                      <Flex m={1} wrap="wrap" gap={3}>
                        {product?.features?.map((f: string, index: number) => (
                          <Text key={index}>{f}</Text>
                        ))}
                      </Flex>
                    </CheckboxGroup>
                  </Box>
                )}

                {product?.noteFabric && (
                  <Box flex={1} w="100%">
                    <Text fontWeight="bold">備考（生地の性質など）</Text>
                    <Box
                      mt={1}
                      p={3}
                      rounded="md"
                      border="1px"
                      borderColor="gray.100"
                    >
                      {product?.noteFabric}
                    </Box>
                  </Box>
                )}
                <Box w="100%">{/* <Text fontWeight="bold">画像</Text> */}</Box>
                {product?.noteEtc && (
                  <Box flex={1} w="100%">
                    <Text fontWeight="bold">備考（その他）</Text>
                    <Box
                      mt={1}
                      p={3}
                      rounded="md"
                      border="1px"
                      borderColor="gray.100"
                    >
                      {product?.noteEtc}
                    </Box>
                  </Box>
                )}
              </Stack>
            </Container>
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
