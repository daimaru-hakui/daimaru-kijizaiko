import { Box, Button, CheckboxGroup, Container, Divider, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Text, Textarea, useDisclosure } from '@chakra-ui/react'
import { doc, onSnapshot } from 'firebase/firestore'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { db } from '../../../firebase'
import { grayFabricsState, suppliersState, usersState } from '../../../store'
import { ProductType } from '../../../types/ProductType'
import ProductEditModal from './ProductEditModal'

type Props = {
  productId: string
}

const ProductModal: NextPage<Props> = ({ productId }) => {
  const [product, setProduct] = useState({} as ProductType);
  const suppliers = useRecoilValue(suppliersState);
  const grayFabrics = useRecoilValue(grayFabricsState);
  const users = useRecoilValue(usersState);
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const getProduct = async () => {
      const docRef = doc(db, "products", `${productId}`);
      try {
        onSnapshot(docRef, (doc) => setProduct({ ...doc.data(), id: doc.id } as ProductType));
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getProduct();
  }, [productId]);

  // 担当者名の表示
  const dispStaff = (id: string) => {
    const user = users?.find(
      (user: { id: string; name: string }) => id === user.id
    );
    return user?.name;
  };

  // 仕入先名の表示
  const dispSupplier = (id: string) => {
    const supplier = suppliers?.find(
      (supplier: { id: string; name: string }) => id === supplier.id
    );
    return supplier?.name;
  };

  const getGrayFabricName = (id: string) => {
    const grayFabric = grayFabrics.find(
      (grayFabric: { id: string }) => id === grayFabric.id
    );
    return `${grayFabric?.productNumber} ${grayFabric?.productName}`;
  };

  const dispMixed = (materials: any) => {
    let array = [];
    const t = materials.t ? `ポリエステル${materials.t}% ` : "";
    const c = materials.c ? `綿${materials.c}% ` : "";
    const n = materials.n ? `ナイロン${materials.n}% ` : "";
    const r = materials.r ? `レーヨン${materials.r}% ` : "";
    const f = materials.f ? `麻${materials.f}% ` : "";
    const pu = materials.pu ? `ポリウレタン${materials.pu}% ` : "";
    const w = materials.w ? `ウール${materials.w}% ` : "";
    const ac = materials.ac ? `アクリル${materials.ac}% ` : "";
    const cu = materials.cu ? `キュプラ${materials.cu}% ` : "";
    const si = materials.si ? `シルク${materials.si}% ` : "";
    const z = materials.z ? `指定外繊維${materials.z}% ` : "";
    array.push(t, c, n, r, f, pu, w, ac, cu, si, z);

    return array
      .filter((item) => item)
      .map((item) => <Text key={item}>{item}</Text>);
  };

  const dispStd = (
    fabricWidth: number,
    fabricLength: number,
    fabricWeight: number
  ) => {
    const width = fabricWidth ? `巾:${fabricWidth}cm` : "";
    const length = fabricLength ? `長さ:${fabricLength}m` : "";
    const weigth = fabricWeight ? `重さ:${fabricWeight}` : "";
    const mark = width && length ? "×" : "";
    return (
      <>
        <Text>{width}</Text>
        <Text>{mark}</Text>
        <Text>{length}</Text>
        <Text ml={3}>{weigth}</Text>
      </>
    );
  };

  return (
    <>
      <Button size='xs' onClick={onOpen}>詳細</Button>
      <Modal isOpen={isOpen} onClose={onClose} size='4xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>生地詳細</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Container maxW="800px" p={6} bg="white" rounded="md">
              <Flex justifyContent="flex-end">
                <ProductEditModal product={product} />
              </Flex>
              <Stack spacing={6} mt={6}>
                <Box p={2} bg="#f4f4f4" textAlign="center">
                  {product?.productType === 1 ? "既製品" : "別注品"}
                </Box>
                {product?.productType === 2 && (
                  <Box>
                    <Text fontWeight="bold">担当者</Text>
                    <Box>{dispStaff(product?.staff)}</Box>
                  </Box>
                )}
                <Flex gap={6}>
                  <Box w="100%">
                    <Text fontWeight="bold">仕入先</Text>
                    <Box>{dispSupplier(product?.supplierId)}</Box>
                  </Box>
                </Flex>
                <Flex
                  gap={1}
                  alignItems="flex-start"
                  justifyContent="space-between"
                  flexDirection={{ base: "column", md: "row" }}
                >
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
                    <Box w="100%">
                      <Text fontWeight="bold">品名</Text>
                      <Box>{product?.productName}</Box>
                    </Box>
                  </Flex>
                  <Flex
                    justifyContent={{ base: "flex-start", md: "flex-end" }}
                    minW="80px"
                  >
                    <Box>
                      <Text fontWeight="bold">単価</Text>
                      <Box>{product?.price}円</Box>
                    </Box>
                  </Flex>
                </Flex>

                {product?.grayFabricId && (
                  <Box flex={1} w="100%">
                    <Text fontWeight="bold">使用キバタ</Text>
                    <Box mt={1}>{getGrayFabricName(product?.grayFabricId)}</Box>
                  </Box>
                )}

                <Box flex={1} w="100%">
                  <Text fontWeight="bold">備考（使用製品品番）</Text>
                  <Textarea mt={1} name="noteProduct" defaultValue={product?.noteProduct} />
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
                          {dispStd(
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
                            {dispMixed(product?.materials)}
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
                    <Textarea mt={1} name="noteProduct" defaultValue={product?.noteFabric} />
                  </Box>
                </Box>
                <Divider />
                <Box flex={1} w="100%">
                  <Text fontWeight="bold">備考（その他）</Text>
                  <Textarea mt={1} name="noteProduct" defaultValue={product?.noteEtc} />
                </Box>
              </Stack>
            </Container>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  )
}

export default ProductModal