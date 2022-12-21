import {
  Box,
  Button,
  CheckboxGroup,
  Container,
  Divider,
  Flex,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../../firebase";
import {
  grayFabricsState,
  loadingState,
  suppliersState,
  usersState,
} from "../../../store";

const ProductsId = () => {
  const router = useRouter();
  const productId = router.query.productId;
  const [product, setProduct] = useState<any>();
  const suppliers = useRecoilValue(suppliersState);
  const grayFabrics = useRecoilValue(grayFabricsState);
  const users = useRecoilValue(usersState);

  useEffect(() => {
    const getProduct = async () => {
      const docRef = doc(db, "products", `${productId}`);
      try {
        onSnapshot(docRef, (doc) => setProduct({ ...doc.data(), id: doc.id }));
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
    <Box w="100%" mt={12}>
      <Container maxW="800px" mt={6} p={0}>
        <Link href="/products">
          <Button w="100%">一覧へ</Button>
        </Link>
      </Container>
      <Container maxW="800px" my={6} p={6} bg="white" rounded="md">
        <Flex justifyContent="space-between">
          <Box as="h1" fontSize="2xl">
            生地詳細
          </Box>
          <Link href={`/products/edit/${productId}`}>
            <Button>編集</Button>
          </Link>
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
              <Box>{dispSupplier(product?.supplier)}</Box>
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

          {product?.grayFabricsId && (
            <Box flex={1} w="100%">
              <Text fontWeight="bold">使用キバタ</Text>
              <Box mt={1}>{getGrayFabricName(product?.grayFabricsId)}</Box>
            </Box>
          )}

          <Box flex={1} w="100%">
            <Text fontWeight="bold">備考（使用製品品番）</Text>
            <Textarea mt={1} name="noteProduct" value={product?.noteProduct} />
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
                {product?.features.map((f: string, index: number) => (
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
              <Textarea mt={1} name="noteProduct" value={product?.noteFabric} />
            </Box>
          </Box>
          <Divider />
          <Box flex={1} w="100%">
            <Text fontWeight="bold">備考（その他）</Text>
            <Textarea mt={1} name="noteProduct" value={product?.noteEtc} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default ProductsId;
