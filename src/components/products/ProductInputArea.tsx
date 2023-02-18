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
import { collection, getDocs } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { features } from "../../../datalist";
import { db } from "../../../firebase";
import {
  colorsState,
  grayFabricsState,
  materialNamesState,
  suppliersState,
  usersState,
} from "../../../store";
import { ProductType } from "../../../types/FabricType";
import { GrayFabricType } from "../../../types/GrayFabricType";
import { SupplierType } from "../../../types/SupplierType";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useInputProduct } from "../../hooks/UseInputProduct";
import { useProductFunc } from "../../hooks/UseProductFunc";
import MaterialsModal from "./MaterialsModal";

type Props = {
  title: string;
  toggleSwitch: string;
  product: ProductType;
  onClose: Function
};

const ProductInputArea: NextPage<Props> = ({
  title,
  toggleSwitch,
  product,
  onClose
}) => {
  const productId = product.id;
  const grayFabrics = useRecoilValue(grayFabricsState);
  const users = useRecoilValue(usersState);
  const suppliers = useRecoilValue(suppliersState);
  const colors = useRecoilValue(colorsState);
  const materialNames = useRecoilValue(materialNamesState);
  const [products, setProducts] = useState([] as ProductType[])
  const { items,
    setItems,
    handleInputChange,
    handleNumberChange,
    handleRadioChange,
    handleCheckedChange
  } = useInputProduct();
  const { addProduct, updateProduct, reset } = useProductFunc(items, setItems);
  const { getMixed } = useGetDisp();

  useEffect(() => {
    setItems({ ...product } as ProductType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  useEffect(() => {
    const getProducts = async () => {
      const docsRef = collection(db, 'products');
      const querysnap = await getDocs(docsRef);
      setProducts(
        querysnap.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as ProductType)
        )
      );
    };
    getProducts();
  }, []);

  // 必須項目を入力しているかをチェック
  const requiredInput = () => {
    const staff = items.productType === 2 ? items.staff : true;
    return (
      !staff ||
      !items.supplierId ||
      !items.productNum ||
      !items.colorName ||
      !items.price
    );
  };

  // 生地が登録しているかのチェック
  const registeredInput = () => {
    const item = items.productNum + items.colorNum + items.colorName;
    const base = products.map(
      (product: ProductType) =>
        product.productNum + product.colorNum + product.colorName
    );
    const result = base?.includes(item);
    return result;
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
              <Text fontWeight="bold">
                担当者
                <Box ml={1} as="span" textColor="red">
                  ※必須
                </Box>
              </Text>
              <Select
                mt={1}
                placeholder="担当者名を選択"
                value={items.staff}
                name="staff"
                onChange={(e) => handleInputChange(e)}
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
              <Text fontWeight="bold">
                仕入先
                <Box ml={1} as="span" textColor="red">
                  ※必須
                </Box>
              </Text>
              <Select
                mt={1}
                placeholder="メーカーを選択してください"
                value={items.supplierId}
                name="supplierId"
                onChange={(e) => handleInputChange(e)}
              >
                {suppliers?.map((supplier: SupplierType) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
          {toggleSwitch === "new" && (
            <Box fontSize="3xl" fontWeight="bold" color="red">
              {registeredInput() && "すでに登録されています。"}
            </Box>
          )}
          <Flex
            gap={6}
            alignItems="center"
            justifyContent="space-between"
            flexDirection={{ base: "column", md: "row" }}
          >
            <Box w="100%" flex="1">
              <Text fontWeight="bold">
                品番
                <Box ml={1} as="span" textColor="red">
                  ※必須
                </Box>
              </Text>
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
                placeholder="例）G1 ハイフンなし"
                value={items.colorNum}
                onChange={handleInputChange}
              />
            </Box>
            <Box w="100%" flex="1">
              <Text fontWeight="bold">
                色
                <Box ml={1} as="span" textColor="red">
                  ※必須
                </Box>
              </Text>
              <Select
                mt={1}
                placeholder="色を選択"
                value={items.colorName}
                name="colorName"
                onChange={(e) => handleInputChange(e)}
              >
                {colors?.map((c: { id: number; name: string }) => (
                  <option key={c.id} value={c.name}>
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
              <Text fontWeight="bold">
                単価（円）
                <Box ml={1} as="span" textColor="red">
                  ※必須
                </Box>
              </Text>
              <NumberInput
                mt={1}
                name="price"
                defaultValue={0}
                min={0}
                max={10000}
                value={items.price === 0 ? "" : items.price}
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
          <Flex gap={6}>
            <Box w="100%">
              <Text fontWeight="bold">キバタ登録</Text>
              <Select
                mt={1}
                placeholder="キバタを選択してください"
                value={items.grayFabricId}
                name="grayFabricId"
                onChange={(e) => handleInputChange(e)}
              >
                {grayFabrics?.map((grayFabric: GrayFabricType) => (
                  <option key={grayFabric.id} value={grayFabric.id}>
                    {grayFabric.productNumber} {grayFabric.productName}
                  </option>
                ))}
              </Select>
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
                  name="materialName"
                  onChange={(e) => handleInputChange(e)}
                >
                  {materialNames?.map((m: { id: number; name: string }) => (
                    <option key={m.id} value={m.name}>
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
                      {getMixed(items.materials)}
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
              {features.map((f) => (
                <Box key={f}>
                  <input
                    id={f}
                    type="checkbox"
                    checked={items?.features?.includes(f)}
                    value={f}
                    name="features"
                    onChange={(e) => handleCheckedChange(e)}
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
            <Button
              colorScheme="facebook"
              disabled={
                !items.supplierId ||
                !items.productNum ||
                !items.colorName ||
                !items.price ||
                registeredInput()
              }
              onClick={addProduct}
            >
              登録
            </Button>
          )}
          {toggleSwitch === "edit" && (
            <Flex gap={3}>
              <Button w="100%"
                onClick={() => {
                  reset(product);
                  onClose()
                }}>
                キャンセル
              </Button>
              <Button w="100%" colorScheme="facebook"
                onClick={() => {
                  updateProduct(productId);
                  onClose();
                }}>
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
