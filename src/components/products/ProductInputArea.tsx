import {
  Box,
  Button,
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
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { features } from "../../../datalist";
import { db } from "../../../firebase";
import {
  colorsState,
  loadingState,
  materialNamesState,
  suppliersState,
  usersState,
} from "../../../store";
import MaterialsModal from "./MaterialsModal";

type Props = {
  items: any;
  setItems: Function;
  title: string;
  toggleSwitch: string;
  product: any;
};

const ProductInputArea: NextPage<Props> = ({
  items,
  setItems,
  title,
  toggleSwitch,
  product,
}) => {
  const router = useRouter();
  const productId = router.query.productId;
  const users = useRecoilValue(usersState);
  const suppliers = useRecoilValue(suppliersState);
  const colors = useRecoilValue(colorsState);
  const materialNames = useRecoilValue(materialNamesState);
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
  const handleCheckedChange = (e: any, name: string) => {
    if (e.target.checked) {
      setItems({
        ...items,
        [name]: [...(items[name] || []), e.target.value],
      });
    } else {
      setItems({
        ...items,
        [name]: [...items[name]?.filter((n: string) => n !== e.target.value)],
      });
    }
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

  const addProduct = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const docRef = collection(db, "products");
    try {
      await addDoc(docRef, {
        productType: items.productType || 1,
        staff: items.productType === 2 ? items.staff : "R&D",
        supplier: items.supplier || "",
        productNumber:
          items.productNum + (items.colorNum ? "-" + items.colorNum : "") || "",
        productNum: items.productNum || "",
        productName: items.productName || "",
        colorNum: Number(items.colorNum) || "",
        color: items.color || "",
        price: items.price || 0,
        materialName: items.materialName || "",
        materials: items.materials || {},
        fabricWidth: items.fabricWidth || "",
        fabricWeight: items.fabricWeight || "",
        fabricLength: items.fabricLength || "",
        features: items.features || [],
        noteProduct: items.noteProduct || "",
        noteFabric: items.noteFabric || "",
        noteEtc: items.noteEtc || "",
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async () => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const docRef = doc(db, "products", `${productId}`);
    try {
      await updateDoc(docRef, {
        productType: items.productType || 1,
        staff: items.productType === 2 ? items.staff : "R&D",
        supplier: items.supplier || "",
        productNumber:
          items.productNum + (items.colorNum ? "-" + items.colorNum : "") || "",
        productNum: items.productNum || "",
        productName: items.productName || "",
        colorNum: Number(items.colorNum) || "",
        color: items.color || "",
        price: items.price || 0,
        materialName: items.materialName || "",
        materials: items.materials || {},
        fabricWidth: items.fabricWidth || "",
        fabricWeight: items.fabricWeight || "",
        fabricLength: items.fabricLength || "",
        features: items.features || [],
        noteProduct: items.noteProduct || "",
        noteFabric: items.noteFabric || "",
        noteEtc: items.noteEtc || "",
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      router.push(`/products/${productId}`);
    }
  };

  const reset = () => {
    setItems(product);
    router.push(`/products/${productId}`);
  };

  return (
    <Box w="100%" mt={12}>
      <Container maxW="800px" my={6} p={6} bg="white" rounded="md">
        <Box as="h1" fontSize="2xl">
          {title}
        </Box>
        <Stack spacing={6} mt={6}>
          <Box w="100%">
            <RadioGroup
              defaultValue="1"
              value={String(items.productType)}
              onChange={(e) => handleRadioChange(e, "productType")}
            >
              <Stack direction="row">
                <Radio value="1">既製品</Radio>
                <Radio value="2">別注品</Radio>
              </Stack>
            </RadioGroup>
          </Box>
          {items.productType === 2 && (
            <Box>
              <Text fontWeight="bold">担当者</Text>
              <Select
                mt={1}
                placeholder="担当者名を選択"
                value={items.staff}
                onChange={(e) => handleSelectchange(e, "staff")}
              >
                {users?.map((user: { id: string; name: string }) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </Box>
          )}
          <Flex gap={6}>
            <Box w="100%">
              <Text fontWeight="bold">仕入先</Text>
              <Select
                mt={1}
                placeholder="メーカーを選択してください"
                value={items.supplier}
                onChange={(e) => handleSelectchange(e, "supplier")}
              >
                {suppliers?.map((supplier: { id: string; name: string }) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
          <Flex
            gap={6}
            alignItems="center"
            justifyContent="space-between"
            flexDirection={{ base: "column", md: "row" }}
          >
            <Box w="100%" flex="1">
              <Text fontWeight="bold">品番</Text>
              <Input
                mt={1}
                name="productNum"
                type="text"
                placeholder="例）M2000 "
                value={items.productNum}
                onChange={handleInputChange}
              />
            </Box>
            <Box w="100%" flex="1">
              <Text fontWeight="bold">色番</Text>
              <Input
                mt={1}
                name="colorNum"
                type="text"
                placeholder="例）G-1"
                value={items.colorNum}
                onChange={handleInputChange}
              />
            </Box>
            <Box w="100%" flex="1">
              <Text fontWeight="bold">色</Text>
              <Select
                mt={1}
                placeholder="色を選択"
                value={items.color}
                onChange={(e) => handleSelectchange(e, "color")}
              >
                {colors?.map((c: { id: number; name: string }) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
          <Flex
            gap={6}
            alignItems="center"
            justifyContent="space-between"
            flexDirection={{ base: "column", md: "row" }}
          >
            <Box flex={2} w="100%">
              <Text fontWeight="bold">品名</Text>
              <Input
                mt={1}
                name="productName"
                type="text"
                placeholder="例）アーバンツイル"
                value={items?.productName}
                onChange={handleInputChange}
              />
            </Box>
            <Box flex={1} w="100%">
              <Text fontWeight="bold">単価（円）</Text>
              <NumberInput
                mt={1}
                name="price"
                defaultValue={0}
                min={0}
                max={10000}
                value={items.price}
                onChange={(e) => handleNumberChange(e, "price")}
              >
                <NumberInputField textAlign="right" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </Flex>
          <Box flex={1} w="100%">
            <Text>備考（使用製品品番）</Text>
            <Textarea
              mt={1}
              name="noteProduct"
              value={items.noteProduct}
              onChange={handleInputChange}
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
                <Text>組織名</Text>
                <Select
                  mt={1}
                  placeholder="組織を選択してください"
                  value={items.materialName}
                  onChange={(e) => handleSelectchange(e, "materialName")}
                >
                  {materialNames?.map((m: { id: number; name: string }) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </Box>
              <Flex gap={6}>
                <Box w="100%">
                  <Text>規格（巾）cm</Text>
                  <NumberInput
                    mt={1}
                    defaultValue={0}
                    min={0}
                    max={200}
                    value={items.fabricWidth}
                    onChange={(e) => handleNumberChange(e, "fabricWidth")}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>
                <Box w="100%">
                  <Text>規格（長さ）m</Text>
                  <NumberInput
                    mt={1}
                    defaultValue={0}
                    min={0}
                    max={200}
                    value={items.fabricLength}
                    onChange={(e) => handleNumberChange(e, "fabricLength")}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>
              </Flex>
              <Box w="100%">
                <Text>規格（重さ）</Text>
                <NumberInput
                  mt={1}
                  defaultValue={0}
                  min={0}
                  max={200}
                  value={items.fabricWeight}
                  onChange={(e) => handleNumberChange(e, "fabricWeight")}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            </Stack>
            <Flex flex={1} gap={6} w="100%">
              <Box w="100%">
                <Text>混率</Text>
                {items.materials && (
                  <Box
                    mt={1}
                    p={3}
                    rounded="md"
                    border="1px"
                    borderColor="gray.100"
                  >
                    <Stack spacing={3} w="100%">
                      {dispMixed(items.materials)}
                    </Stack>
                  </Box>
                )}
                <MaterialsModal items={items} setItems={setItems} />
              </Box>
            </Flex>
          </Flex>

          <Box w="100%">
            <Text>機能性</Text>

            <Flex
              m={1}
              p={2}
              wrap="wrap"
              rounded="md"
              border="1px"
              borderColor="gray.100"
              gap={3}
            >
              {features.map((f, index) => (
                <Box key={f}>
                  <input
                    id={f}
                    type="checkbox"
                    checked={items?.features?.includes(f)}
                    value={f}
                    onChange={(e) => handleCheckedChange(e, "features")}
                  />
                  <Box as="span" mx={1}>
                    <label htmlFor={f}>{f}</label>
                  </Box>
                </Box>
              ))}
            </Flex>
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
          {toggleSwitch === "new" && (
            <Button colorScheme="facebook" onClick={addProduct}>
              登録
            </Button>
          )}
          {toggleSwitch === "edit" && (
            <Flex gap={3}>
              <Button w="100%" onClick={reset}>
                キャンセル
              </Button>
              <Button w="100%" colorScheme="facebook" onClick={updateProduct}>
                更新
              </Button>
            </Flex>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default ProductInputArea;
