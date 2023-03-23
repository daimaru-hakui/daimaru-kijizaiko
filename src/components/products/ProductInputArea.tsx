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
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { features } from "../../../datalist";
import {
  colorsState,
  grayFabricsState,
  materialNamesState,
  productsState,
  suppliersState,
} from "../../../store";
import { ColorType } from "../../../types/ColorType";
import { ProductType } from "../../../types/FabricType";
import { GrayFabricType } from "../../../types/GrayFabricType";
import { MaterialNameType } from "../../../types/MaterialNameType";
import { SupplierType } from "../../../types/SupplierType";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useProductFunc } from "../../hooks/UseProductFunc";
import MaterialsModal from "./MaterialsModal";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";

type Props = {
  title: string;
  pageType: string;
  product: ProductType;
  onClose?: Function;
};

const ProductInputArea: NextPage<Props> = ({
  title,
  pageType,
  product,
  onClose,
}) => {
  // const { data: products } = useSWR(`/api/products`);
  const products = useRecoilValue(productsState);
  const { data: users } = useSWRImmutable(`/api/users/sales`);
  const grayFabrics = useRecoilValue(grayFabricsState);
  const suppliers = useRecoilValue(suppliersState);
  const colors = useRecoilValue(colorsState);
  const materialNames = useRecoilValue(materialNamesState);
  const [flag, setFlag] = useState(false);
  const { getMixed } = useGetDisp();
  const [obj, setObj] = useState<any>({});
  const {
    getValues,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...product,
    },
  });
  useEffect(() => {
    setObj({ ...product?.materials });
  }, [product?.materials]);

  const { addProduct, updateProduct } = useProductFunc();

  const onSubmit = (data: ProductType) => {
    if (pageType === "new") {
      addProduct(data, obj);
    }
    if (pageType === "edit") {
      updateProduct(product.id, data, obj);
      onClose();
    }
  };

  useEffect(() => {
    let [productNum, colorNum] = [watch("productNum"), watch("colorNum")];
    if (!productNum) productNum = "noValue";
    if (!colorNum) colorNum = "noValue";
    const base = products?.map(
      (product: ProductType) => product.productNum + product.colorNum
    );
    const result = base?.includes(productNum + colorNum);
    !result ? setFlag(false) : setFlag(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("productNum"), watch("colorNum")]);

  return (
    <>
      <Box as="h1" fontSize="2xl">
        {title}
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={6} mt={6}>
          <Box w="100%">
            <RadioGroup value={getValues("productType")}>
              <Stack direction="row">
                <Radio value="1" {...register("productType")}>
                  既製品
                </Radio>
                <Radio value="2" {...register("productType")}>
                  別注品
                </Radio>
              </Stack>
            </RadioGroup>
          </Box>
          {Number(watch("productType")) === 2 && (
            <Box>
              <Text fontWeight="bold">
                担当者
                <Box ml={1} as="span" textColor="red">
                  ※
                </Box>
              </Text>
              <Select
                mt={1}
                placeholder="担当者名を選択"
                {...register("staff", { required: true })}
              >
                {users?.contents?.map((user: { id: string; name: string }) => (
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
                  ※
                </Box>
              </Text>
              <Select
                mt={1}
                placeholder="メーカーを選択してください"
                {...register("supplierId", { required: true })}
              >
                {suppliers?.map((supplier: SupplierType) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>

          {pageType === "new" && (
            <Box fontSize="md" fontWeight="bold" color="red">
              {flag && "※すでに登録されています。"}
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
                  ※
                </Box>
              </Text>
              <Input
                mt={1}
                placeholder="例）M2000 ハイフンなし "
                {...register("productNum", { required: true })}
              />
            </Box>
            <Box w="100%" flex="1">
              <Text fontWeight="bold">色番</Text>
              <Input
                mt={1}
                placeholder="例）G1 ハイフンなし"
                {...register("colorNum")}
              />
            </Box>
            <Box w="100%" flex="1">
              <Text fontWeight="bold">
                色
                <Box ml={1} as="span" textColor="red">
                  ※
                </Box>
              </Text>
              <Select
                mt={1}
                placeholder="色を選択"
                {...register("colorName", { required: true })}
              >
                {colors?.map((c: ColorType) => (
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
                placeholder="例）アーバンツイル"
                {...register("productName")}
              />
            </Box>
            <Box flex={1} w="100%">
              <Text fontWeight="bold">
                単価（円）
                <Box ml={1} as="span" textColor="red">
                  ※
                </Box>
              </Text>
              <NumberInput
                mt={1}
                {...register("price", { required: true })}
                min={0}
                max={100000}
                onChange={() => getValues}
              >
                <NumberInputField textAlign="right" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </Flex>
          <Flex
            w={{ base: "100%", md: "400px" }}
            gap={6}
            alignItems="center"
            justifyContent="space-between"
            // flexDirection={{ base: "column", md: "row" }}
          >
            <Box flex={1} w="100%">
              <Text fontWeight="bold">外部 初期在庫（ｍ）</Text>
              <NumberInput
                mt={1}
                {...register("externalStock")}
                min={0}
                max={100000}
                onChange={() => getValues}
              >
                <NumberInputField textAlign="right" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
            <Box flex={1} w="100%">
              <Text fontWeight="bold">徳島 初期在庫（ｍ）</Text>
              <NumberInput
                mt={1}
                {...register("tokushimaStock")}
                min={0}
                max={100000}
                onChange={() => getValues}
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
                {...register("grayFabricId")}
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
            <Textarea mt={1} {...register("noteProduct")} />
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
                  {...register("materialName")}
                >
                  {materialNames?.map((m: MaterialNameType) => (
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
                    {...register("fabricWidth")}
                    min={0}
                    max={200}
                    onChange={() => getValues}
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
                    {...register("fabricLength")}
                    min={0}
                    max={200}
                    onChange={() => getValues}
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
                  {...register("fabricWeight")}
                  min={0}
                  max={200}
                  onChange={() => getValues}
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
                {obj && (
                  <Box
                    mt={1}
                    p={3}
                    rounded="md"
                    border="1px"
                    borderColor="gray.100"
                  >
                    <Stack spacing={3} w="100%">
                      {getMixed(obj).map((material, index) => (
                        <Text key={index}>{material}</Text>
                      ))}
                    </Stack>
                  </Box>
                )}
                <MaterialsModal obj={obj} setObj={setObj} />
              </Box>
            </Flex>
          </Flex>
          <Box w="full">
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
              {features.map((feature) => (
                <Box key={feature}>
                  <input
                    id={feature}
                    type="checkbox"
                    {...register(`features`)}
                    value={feature}
                  />
                  <Box as="span" mx={1}>
                    <label htmlFor={feature}>{feature}</label>
                  </Box>
                </Box>
              ))}
            </Flex>
          </Box>
          <Box w="full">
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
          <Box flex={1} w="full">
            <Text>備考（生地の性質など）</Text>
            <Textarea mt={1} {...register("noteFabric")} />
          </Box>
          <Divider />
          <Box flex={1} w="full">
            <Text>備考（その他）</Text>
            <Textarea mt={1} {...register("noteEtc")} />
          </Box>
          {pageType === "new" && (
            <Button type="submit" colorScheme="facebook" disabled={flag}>
              登録
            </Button>
          )}
          {pageType === "edit" && (
            <Flex gap={3}>
              <Button
                w="100%"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                キャンセル
              </Button>
              <Button type="submit" w="100%" colorScheme="facebook">
                更新
              </Button>
            </Flex>
          )}
        </Stack>
      </form>
    </>
  );
};

export default ProductInputArea;
