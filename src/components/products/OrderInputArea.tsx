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
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useRecoilValue } from "recoil";
import {
  grayFabricsState,
  stockPlacesState,
} from "../../../store";
import { ProductType } from "../../../types/FabricType";
import { useInputHistory } from "../../hooks/UseInputHistory";
import { useOrderFabricFunc } from "../../hooks/UseOrderFabricFunc";
import { useUtil } from "../../hooks/UseUtil";

type Props = {
  product: ProductType;
  orderType: string;
  onClose: Function;
};

const OrderInputArea: NextPage<Props> = ({ product, orderType, onClose }) => {
  const grayFabrics = useRecoilValue(grayFabricsState);
  const grayFabricId = product?.grayFabricId || "";
  const stockPlaces = useRecoilValue(stockPlacesState);
  const { getTodayDate } = useUtil();
  const { items, handleInputChange, handleNumberChange, handleRadioChange } = useInputHistory()
  const { orderFabricDyeingFromStock, orderFabricDyeingFromRanning, orderFabricPurchase } = useOrderFabricFunc(items, product, orderType)

  const isLimitDyeing = () => {
    const grayFabric = grayFabrics.find(
      (grayFabric: { id: string }) => grayFabric.id === grayFabricId
    );
    const stock = grayFabric?.stock || 0;
    return items.stockType === "stock" && stock < items.quantity ? true : false;
  };

  const isLimitPurchase = () => {
    const stock = product?.externalStock || 0;
    return items.stockType === "stock" && stock < items.quantity ? true : false;
  };

  return (
    <Box>
      <Stack spacing={6}>
        {orderType === "dyeing" && (
          <RadioGroup
            mt={3}
            onChange={(e) => handleRadioChange(e, "stockType")}
            value={items.stockType}
          >
            <Stack direction="column">
              <Radio value="ranning">メーカーの定番キバタから加工</Radio>
              {product.grayFabricId && (
                <Radio value="stock">キバタ在庫から加工</Radio>
              )}
            </Stack>
          </RadioGroup>
        )}

        {orderType === "purchase" && (
          <>
            <RadioGroup
              mt={3}
              onChange={(e) => handleRadioChange(e, "stockType")}
              value={items.stockType}
            >
              <Stack direction="column">
                <Radio value="ranning">
                  生地を購入
                  <Box as="span" fontSize="sm">
                    （メーカーの定番在庫）
                  </Box>
                </Radio>
                <Radio value="stock">
                  外部在庫から購入
                  <Box as="span" fontSize="sm">
                    （別染めなどでメーカーに抱えてもらっている在庫）
                  </Box>
                </Radio>
              </Stack>
            </RadioGroup>
            <Box w="100%">
              <Text>送り先名</Text>
              <Select
                mt={1}
                name="stockPlace"
                placeholder="送り先を選択してください"
                value={items.stockPlace}
                defaultValue="徳島工場"
                onChange={handleInputChange}
              >
                {stockPlaces?.map((m: { id: number; name: string }) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Box>
          </>
        )}

        <Flex gap={3} w="100%" flexDirection={{ base: "column", md: "row" }}>
          <Box w="100%">
            <Box>発注日</Box>
            <Input
              mt={1}
              type="date"
              name="orderedAt"
              value={items.orderedAt || getTodayDate()}
              onChange={handleInputChange}
            />
          </Box>
          <Box w="100%">
            <Box>入荷予定日</Box>
            <Input
              mt={1}
              type="date"
              name="scheduledAt"
              value={items.scheduledAt || getTodayDate()}
              onChange={handleInputChange}
            />
          </Box>
        </Flex>
        <Flex gap={3} w="100%" flexDirection={{ base: "column", md: "row" }}>
          <Box w="100%">
            <Text>価格（円）</Text>
            <NumberInput
              mt={1}
              w="100%"
              name="price"
              defaultValue={0}
              min={0}
              max={10000}
              value={items.price || product.price}
              onChange={(e) => handleNumberChange(e, "price")}
            >
              <NumberInputField textAlign="right" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
          <Box w="100%">
            <Text>数量（m）</Text>
            <NumberInput
              mt={1}
              w="100%"
              name="price"
              defaultValue={0}
              min={0}
              max={100000}
              value={items.quantity}
              onChange={(e) => handleNumberChange(e, "quantity")}
            >
              <NumberInputField textAlign="right" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        </Flex>
        <Box>
          <Text>備考</Text>
          <Textarea
            name="comment"
            value={items.comment}
            onChange={handleInputChange}
          />
        </Box>
        {orderType === "dyeing" && (
          <Button
            size="md"
            colorScheme="facebook"
            disabled={!items.stockType || !items.quantity || Number(items.quantity) === 0 || isLimitDyeing()}
            onClick={() => {
              items.stockType === "stock" && orderFabricDyeingFromStock();
              items.stockType === "ranning" && orderFabricDyeingFromRanning();
              onClose();
            }}
          >
            登録
          </Button>
        )}
        {orderType === "purchase" && (
          <Button
            size="md"
            colorScheme="facebook"
            disabled={!items.stockType || !items.quantity || Number(items.quantity) === 0 || isLimitPurchase()}
            onClick={() => {
              orderFabricPurchase(items.stockType);
              onClose();
            }}
          >
            登録
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default OrderInputArea;
