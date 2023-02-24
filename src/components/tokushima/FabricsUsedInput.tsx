import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FaWindowClose } from "react-icons/fa";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loadingState, productsState } from "../../../store";
import { CuttingReportType } from "../../../types/CuttingReportType";
import { CuttingProductType } from "../../../types/CuttingProductType";
// import { ProductType } from "../../../types/ProductType";
import { db } from "../../../firebase";
import { doc, getDoc, runTransaction, updateDoc } from "firebase/firestore";
import { useCuttingReportFunc } from "../../hooks/UseCuttingReportFunc";
import { useUtil } from "../../hooks/UseUtil";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { ProductType } from "../../../types/FabricType";

type Props = {
  items: CuttingReportType;
  setItems: Function;
  product: CuttingProductType;
  rowIndex: number;
  reportId: string;
  setIsLimitQuantity: Function;
};

export const FabricsUsedInput: NextPage<Props> = ({
  items,
  setItems,
  product,
  rowIndex,
  reportId,
  setIsLimitQuantity,
}) => {
  const products = useRecoilValue(productsState);
  const [filterProducts, setFilterProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const setLoading = useSetRecoilState(loadingState);
  const { calcScale } = useCuttingReportFunc(null, null);
  const { halfToFullChar } = useUtil();
  const { getTokushimaStock } = useGetDisp();
  const categories = ["表地", "裏地", "芯地", "配色", "その他"];
  const [maxLimitQuantity, setMaxLimitQuantity] = useState(0);

  useEffect(() => {
    setFilterProducts(
      products.filter((product: ProductType) =>
        product.productNumber.includes(halfToFullChar(searchText.toUpperCase()))
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, products]);

  // 入力値の最大値をリミットにする
  useEffect(() => {
    const getQuantity = () => {
      setMaxLimitQuantity(
        Number(getTokushimaStock(product.productId)) + Number(product?.quantity)
      );
    };
    getQuantity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.productId]);

  //　在庫より入力値が大きい場合trueを返す
  useEffect(() => {
    const limit = reportId
      ? maxLimitQuantity // 編集の場合　maxLimitQuantity
      : getTokushimaStock(product.productId);
    const result = limit < items.products[rowIndex].quantity ? true : false;
    setIsLimitQuantity(result);
  }, [
    items.products,
    reportId,
    product.productId,
    rowIndex,
    maxLimitQuantity,
    setIsLimitQuantity,
    getTokushimaStock,
  ]);

  const handleInputsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    rowIndex: number
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems(() => {
      let newArray = [];
      newArray = items.products.map((product, index) =>
        index === rowIndex ? { ...product, [name]: value } : product
      );
      return { ...items, products: [...newArray] };
    });
  };

  const handleNumbersChange = (e: string, name: string, rowIndex: number) => {
    const value = e;
    setItems(() => {
      let newArray = [];
      newArray = items.products.map((product, index) =>
        index === rowIndex ? { ...product, [name]: value } : product
      );
      return { ...items, products: [...newArray] };
    });
  };

  // 商品の行を削除;
  const deleteRowProduct = (rowIndex: number) => {
    const result = window.confirm("削除してよろしいでしょうか?");
    if (!result) return;
    setItems(() => {
      let newArray = [];
      newArray = items.products.filter((_, index) => index !== rowIndex);
      return { ...items, products: [...newArray] };
    });
  };

  // 商品の行を削除（編集画面）;
  const deleteRowProductUpdate = async (rowIndex: number) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    setLoading(true);

    setItems(() => {
      let newArray = [];
      newArray = items.products.filter((_, index) => index !== rowIndex);
      return { ...items, products: [...newArray] };
    });
    setLoading(false);

    if (!items.products[rowIndex].productId) {
      return;
    }

    const cuttingReportDocRef = doc(db, "cuttingReports", reportId);
    const productDocRef = doc(db, "products", product.productId);

    try {
      runTransaction(db, async (transaction) => {
        const cuttingReportSnap = await getDoc(cuttingReportDocRef);
        if (!cuttingReportSnap.exists())
          throw "cuttingReportSnap does not exist!";

        const productSnap = await getDoc(productDocRef);
        if (!productSnap.exists()) throw "productSnap does not exist!";

        let newArray = [];
        newArray = items.products.filter((_, index) => index !== rowIndex);
        const newObj = { ...items, products: [...newArray] };

        transaction.update(cuttingReportDocRef, {
          ...newObj,
        });

        const newTokushimaStock =
          productSnap.data().tokushimaStock + (Number(product.quantity) || 0);
        transaction.update(productDocRef, {
          tokushimaStock: Number(newTokushimaStock),
        });
      });
    } catch (err) {
      console.log(err);
      window.alert("登録失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Flex
          mt={6}
          w="full"
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex gap={3}>
            <Text fontWeight="bold">
              使用生地
              <Box as="span" pl={2}>
                {rowIndex + 1}
              </Box>
            </Text>
            <Flex alignItems="center">
              <Input
                type="text"
                size="xs"
                w="32"
                mr={1}
                value={searchText}
                placeholder="品番絞り込み"
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button size="xs" onClick={() => setSearchText("")}>
                解除
              </Button>
            </Flex>
          </Flex>
          <FaWindowClose
            cursor="pointer"
            onClick={() =>
              reportId
                ? deleteRowProductUpdate(rowIndex)
                : deleteRowProduct(rowIndex)
            }
          />
        </Flex>
      </Box>
      <Box p={3} border="1px" borderColor="gray.200">
        <Flex gap={3} w="full" flexDirection={{ base: "column", md: "row" }}>
          <Box minW="100px">
            <Text fontWeight="bold">選択</Text>
            <Select
              mt={1}
              placeholder="選択"
              value={product.category}
              name="category"
              onChange={(e) => handleInputsChange(e, rowIndex)}
            >
              {categories?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Box>
          <Box w="full">
            <Text fontWeight="bold">
              品名{" "}
              {product.productId &&
                `(在庫 ${Number(getTokushimaStock(product.productId))}m)`}
            </Text>
            <Select
              mt={1}
              placeholder="選択"
              value={product.productId}
              name="productId"
              onChange={(e) => handleInputsChange(e, rowIndex)}
            >
              {filterProducts?.map((product: any, index: number) => (
                <option key={index} value={product.id}>
                  {product.productNumber}
                  {"  "}
                  {product.productName}
                  {"  "}
                  {product.colorName}
                </option>
              ))}
            </Select>
          </Box>

          <Box minW="100px">
            <Text fontWeight="bold">数量（m）</Text>
            <NumberInput
              mt={1}
              name="quantity"
              defaultValue={0}
              min={0}
              max={
                reportId
                  ? maxLimitQuantity // 編集
                  : getTokushimaStock(product.productId) //新規
              }
              bg={
                reportId
                  ? maxLimitQuantity < product?.quantity // 編集
                    ? "red.300"
                    : ""
                  : getTokushimaStock(product.productId) < product?.quantity //新規
                  ? "red.300"
                  : ""
              }
              rounded="md"
              value={product?.quantity}
              onChange={(e) => handleNumbersChange(e, "quantity", rowIndex)}
            >
              <NumberInputField textAlign="right" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
          <Box minW="100px">
            <Text fontWeight="bold">用尺（m）</Text>
            <Input
              mt={1}
              type="text"
              textAlign="right"
              readOnly
              bg="gray.100"
              value={calcScale(
                items?.products[rowIndex].quantity,
                items.totalQuantity
              )}
            />
          </Box>
        </Flex>
      </Box>
    </Stack>
  );
};
