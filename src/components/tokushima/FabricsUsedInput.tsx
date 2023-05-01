import {
  Box,
  Button,
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
import { useEffect, useState, FC } from "react";
import { useRecoilValue } from "recoil";
import { currentUserState, productsState } from "../../../store";
import {
  ProductType,
  CuttingProductType,
  CuttingReportType,
} from "../../../types";
import { db } from "../../../firebase";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { useCuttingReportFunc } from "../../hooks/UseCuttingReportFunc";
import { useUtil } from "../../hooks/UseUtil";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { StockEditModal } from "./StockEditModal";

type Props = {
  items: CuttingProductType[];
  setItems: Function;
  product: any;
  rowIndex: number;
  reportId: string;
  report: CuttingReportType;
  setIsLimitQuantity: Function;
  totalQuantity: number;
};

export const FabricsUsedInput: FC<Props> = ({
  items,
  setItems,
  product,
  rowIndex,
  report,
  reportId,
  setIsLimitQuantity,
  totalQuantity,
}) => {
  const products = useRecoilValue(productsState);
  const currentUser = useRecoilValue(currentUserState);
  const { halfToFullChar } = useUtil();
  const { getTokushimaStock } = useGetDisp();
  const [filterProducts, setFilterProducts] = useState<ProductType[]>([]);
  const [searchText, setSearchText] = useState("");
  const { calcScale } = useCuttingReportFunc(null, null);
  const categories = ["表地", "裏地", "芯地", "配色", "その他"];
  const [maxLimitQuantity, setMaxLimitQuantity] = useState(0);

  // 絞り込み
  useEffect(() => {
    setFilterProducts(() => {
      let result = [];
      result = products.filter((product: ProductType) =>
        product.productNumber.includes(halfToFullChar(searchText.toUpperCase()))
      );
      if (items[rowIndex].category === "芯地") {
        result = result.filter((product) => product.interfacing === true);
      }
      return result;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, products, items[rowIndex].category]);

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
      : getTokushimaStock(product.productId); // 新規作成の場合
    const result = limit < items[rowIndex].quantity ? true : false;
    setIsLimitQuantity(result);
  }, [
    items,
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
    if (e.type === "change" && name === "productId")
      items[rowIndex].quantity = 0;
    setItems(
      items.map((product, index) =>
        index === rowIndex ? { ...product, [name]: value } : product
      )
    );
  };

  const handleNumbersChange = (e: string, name: string, rowIndex: number) => {
    const value = e;
    setItems(
      items.map((product, index) =>
        index === rowIndex ? { ...product, [name]: value } : product
      )
    );
  };

  // 商品の行を削除;
  const deleteRowProduct = (rowIndex: number) => {
    const result = window.confirm("削除してよろしいでしょうか?");
    if (!result) return;
    setItems(items.filter((_, index) => index !== rowIndex));
  };

  // 商品の行を削除（編集画面）;
  const deleteRowProductUpdate = async (rowIndex: number) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    setItems(items.filter((_, index) => index !== rowIndex));
    if (!items[rowIndex].productId) {
      return;
    }

    const arrayItems = items.map((item) => item.productId);
    const baseProductId = report.products[rowIndex]?.productId;
    const result2 = arrayItems.includes(baseProductId);
    if (!result2) return;

    const cuttingReportDocRef = doc(db, "cuttingReports", reportId);
    const productDocRef = doc(db, "products", product.productId);

    try {
      runTransaction(db, async (transaction) => {
        const cuttingReportSnap = await transaction.get(cuttingReportDocRef);
        if (!cuttingReportSnap.exists())
          throw "cuttingReportSnap does not exist!";

        const productSnap = await transaction.get(productDocRef);
        if (!productSnap.exists()) throw "productSnap does not exist!";

        const newArray = items.filter((_, index) => index !== rowIndex);
        const newObj = { ...cuttingReportSnap.data(), products: newArray };
        transaction.update(cuttingReportDocRef, {
          ...newObj,
          createdAt: cuttingReportSnap.data().createdAt.toDate(),
          updatedUser: currentUser,
          updatedAt: serverTimestamp(),
        });

        const newTokushimaStock =
          productSnap.data().tokushimaStock + (Number(product.quantity) || 0);
        transaction.update(productDocRef, {
          tokushimaStock: Number(newTokushimaStock),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
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
            <Text fontWeight="bold">
              選択
              <Box as="span" color="red">
                ※
              </Box>
            </Text>
            <Select
              mt={1}
              placeholder="選択"
              value={items[rowIndex].category}
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
            <Flex fontWeight="bold" alignItems="center">
              品名
              <Box as="span" color="red">
                ※
              </Box>
              {product.productId && (
                <>
                  (在庫 {Number(getTokushimaStock(product.productId))}m)
                  <StockEditModal productId={product.productId} />
                </>
              )}
            </Flex>
            <Select
              mt={1}
              placeholder="選択"
              value={product.productId}
              name="productId"
              onChange={(e) => handleInputsChange(e, rowIndex)}
            >
              {filterProducts?.map((product, index: number) => (
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
            <Text fontWeight="bold">
              数量(m)
              <Box as="span" color="red">
                ※
              </Box>
            </Text>
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
            <Text fontWeight="bold">用尺(m)</Text>
            <Input
              mt={1}
              type="text"
              textAlign="right"
              readOnly
              bg="gray.100"
              value={calcScale(items[rowIndex].quantity, totalQuantity)}
            />
          </Box>
        </Flex>
      </Box>
    </Stack>
  );
};
