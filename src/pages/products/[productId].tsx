import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { colors, features, materialNames } from "../../../datalist";
import { db } from "../../../firebase";
import { loadingState, usersAuth } from "../../../store";
import MaterialsModal from "../../components/products/MaterialsModal";

const ProductsId = () => {
  const router = useRouter();
  const productId = router.query.productId;
  const [items, setItems] = useState<any>({});
  const [product, setProduct] = useState<any>();
  const [suppliers, setSuppliers] = useState<any>();
  const users = useRecoilValue(usersAuth);
  const setLoading = useSetRecoilState(loadingState);

  const handleSelectchange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    name: string
  ) => {
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: string, name: string) => {
    console.log(e);
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  const handleRadioChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  useEffect(() => {
    const getProduct = async () => {
      const docRef = doc(db, "products", `${productId}`);
      try {
        await onSnapshot(docRef, (doc) =>
          setProduct({ ...doc.data(), id: doc.id })
        );
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getProduct();
  }, []);

  console.log(product);

  useEffect(() => {
    const getSuppliers = async () => {
      const q = query(collection(db, "suppliers"), orderBy("kana", "asc"));
      try {
        const querySnap = await getDocs(q);
        setSuppliers(
          querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getSuppliers();
  }, []);

  const dispColor = (colorNum: number) => {
    const result = colors.find(
      (color: { id: number; name: string }) => color.id === colorNum
    );
    return result?.name;
  };

  const dispMaterialName = (materialName: number) => {
    const result = materialNames.find(
      (material: { id: number; name: string }) => material.id === materialName
    );
    return result?.name;
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
      .map((item) => <Box key={item}>{item}</Box>);
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
    return `${width}${mark}${length}　${weigth}`;
  };

  return (
    <Container maxW="800px" my={6} p={6} bg="white" rounded="md">
      <Box as="h1" fontSize="2xl">
        生地詳細
      </Box>
      <Stack spacing={6} mt={6}>
        <Box w="100%">{product?.productType === 1 ? "既製品" : "別注品"}</Box>
        {product?.productType === 2 && (
          <Box>
            <Text fontWeight="bold">担当者</Text>
            <Box>{product?.staff}</Box>
          </Box>
        )}
        <Flex gap={6}>
          <Box w="100%">
            <Text fontWeight="bold">仕入先</Text>
            <Box>{product?.supplier}</Box>
          </Box>
        </Flex>
        <Flex
          gap={1}
          alignItems="center"
          justifyContent="flex-start"
          flexDirection={{ base: "column", md: "row" }}
        >
          <Box w="100%">
            <Text fontWeight="bold">品番</Text>
            <Box>
              {product?.productNum}-{product?.colorNum}
            </Box>
          </Box>
          <Box w="100%">
            <Text fontWeight="bold">色</Text>
            <Box>{dispColor(product?.colorName)}</Box>
          </Box>
          <Box w="100%">
            <Text fontWeight="bold">品名</Text>
            {product?.productName}
          </Box>
          <Box w="100%">
            <Text fontWeight="bold">単価</Text>
            {product?.price}円
          </Box>
        </Flex>

        <Box flex={1} w="100%">
          <Text>備考（使用製品品番）</Text>
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
              <Text>組織名</Text>
              {dispMaterialName(product?.materialName)}
            </Box>
            <Flex gap={6}>
              <Box w="100%">
                <Text>規格</Text>
                <Box>
                  {dispStd(
                    product?.fabricWidth,
                    product?.fabricLength,
                    product?.fabricWeight
                  )}
                </Box>
              </Box>
            </Flex>
          </Stack>
          <Flex flex={1} gap={6} w="100%">
            <Box w="100%">
              <Text>混率</Text>
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
          <Text>機能性</Text>
          <CheckboxGroup colorScheme="green">
            <Flex
              m={1}
              wrap="wrap"
              rounded="md"
              border="1px"
              borderColor="gray.100"
            >
              {features.map((f) => (
                <Checkbox key={f} value={f} mt={2} mx={2} mb={2}>
                  {f}
                </Checkbox>
              ))}
            </Flex>
          </CheckboxGroup>
        </Box>

        <Box w="100%">
          <Text>画像</Text>
          <FormControl mt={1}>
            <FormLabel htmlFor="gazo" mb="0" w="150px" cursor="pointer">
              <Box
                p={2}
                fontWeight="bold"
                textAlign="center"
                color="#385898"
                border="1px"
                borderColor="#385898"
                rounded="md"
              >
                アップロード
              </Box>
            </FormLabel>
            <Input
              mt={1}
              id="gazo"
              display="none"
              type="file"
              accept="image/*"
            />
          </FormControl>
        </Box>
        <Box flex={1} w="100%">
          <Text>備考（生地の性質など）</Text>
          <Textarea
            mt={1}
            name="noteFabric"
            value={items.noteFabric}
            onChange={handleInputChange}
          />
        </Box>
        <Divider />
        <Box flex={1} w="100%">
          <Text>備考（その他）</Text>
          <Textarea
            mt={1}
            name="noteEtc"
            value={items.noteEtc}
            onChange={handleInputChange}
          />
        </Box>
      </Stack>
    </Container>
  );
};

export default ProductsId;
