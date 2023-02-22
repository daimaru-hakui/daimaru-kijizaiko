import {
  Box,
  Button,
  CheckboxGroup,
  Container,
  Divider,
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
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { ProductType } from "../../../types/FabricType";
import { useGetDisp } from "../../hooks/UseGetDisp";
import ProductEditModal from "./ProductEditModal";

type Props = {
  productId: string;
};

const ProductModal: NextPage<Props> = ({ productId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [product, setProduct] = useState({} as ProductType);
  const {
    getUserName,
    getSupplierName,
    getMixed,
    getFabricStd,
    getGrayFabricName,
    getGrayFabricNumber,
  } = useGetDisp();

  useEffect(() => {
    const getProduct = async () => {
      const docsRef = doc(db, "products", productId);
      const docSnap = await getDoc(docsRef);
      setProduct({ ...docSnap.data(), id: docSnap.id } as ProductType);
    };
    getProduct();
  }, [productId]);

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        colorScheme="facebook"
        onClick={onOpen}
      >
        詳細
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex gap={3} alignItems="center">
              生地詳細
              <ProductEditModal product={product} />
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

                {product?.grayFabricId && (
                  <Box flex={1} w="100%">
                    <Text fontWeight="bold">使用キバタ</Text>
                    <Box mt={1}>
                      {getGrayFabricNumber(product?.grayFabricId)}{" "}
                      {getGrayFabricName(product?.grayFabricId)}
                    </Box>
                  </Box>
                )}

                <Box flex={1} w="100%">
                  <Text fontWeight="bold">備考（使用製品品番）</Text>
                  <Textarea
                    mt={1}
                    name="noteProduct"
                    defaultValue={product?.noteProduct}
                  />
                </Box>

                <Divider />

                <Flex
                  gap={6}
                  w="100%"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  flexDirection={{ base: "column", md: "row" }}
                >
                  <Stack spacing={6} flex={1} w="100%">
                    <Box w="100%">
                      <Text fontWeight="bold">組織名</Text>
                      {product?.materialName}
                    </Box>
                    <Flex gap={6}>
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
                    </Flex>
                  </Stack>
                  <Flex flex={1} gap={6} w="100%">
                    <Box w="100%">
                      <Text fontWeight="bold">混率</Text>
                      {product?.materials && (
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
                      )}
                    </Box>
                  </Flex>
                </Flex>

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

                <Box w="100%">
                  <Text fontWeight="bold">画像</Text>
                </Box>
                <Box flex={1} w="100%">
                  <Box flex={1} w="100%">
                    <Text fontWeight="bold">備考（生地の性質など）</Text>
                    <Textarea
                      mt={1}
                      name="noteProduct"
                      defaultValue={product?.noteFabric}
                    />
                  </Box>
                </Box>
                <Divider />
                <Box flex={1} w="100%">
                  <Text fontWeight="bold">備考（その他）</Text>
                  <Textarea
                    mt={1}
                    name="noteProduct"
                    defaultValue={product?.noteEtc}
                  />
                </Box>
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

export default ProductModal;
