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
import { FC } from "react";
import { useSettingStore } from "../../../store";
import { Product } from "../../../types";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useOrderFabricFunc } from "../../hooks/UseOrderFabricFunc";
import { useUtil } from "../../hooks/UseUtil";
import { Controller, useForm } from "react-hook-form";

type Props = {
  product: Product;
  orderType: string;
  onClose: Function;
};

export type OrderInputs = {
  stockType: string;
  stockPlace: string;
  orderedAt: string;
  scheduledAt: string;
  price: number;
  quantity: number;
  comment: string;
};

export const OrderInputArea: FC<Props> = ({ product, orderType, onClose }) => {
  const grayFabricId = product?.grayFabricId || "";
  const stockPlaces = useSettingStore((state) => state.stockPlaces);
  const { getTodayDate } = useUtil();
  const { getGrayFabricStock } = useGetDisp();
  const {
    orderFabricDyeingFromStock,
    orderFabricDyeingFromRanning,
    orderFabricPurchase,
  } = useOrderFabricFunc(product, orderType);

  const form = useForm<OrderInputs>();

  const isLimit = (orderType: string) => {
    let stock = 0;
    if (orderType === "dyeing") {
      stock = getGrayFabricStock(grayFabricId);
    }
    if (orderType === "purchase") {
      stock = product?.externalStock || 0;
    }
    const result =
      form.watch("stockType") === "stock" && stock < form.watch("quantity")
        ? true
        : false;
    return (
      !form.watch("stockType") ||
      !form.watch("quantity") ||
      Number(form.watch("quantity")) === 0 ||
      !form.watch("comment") ||
      result
    );
  };

  const getLimitQuantity = () => {
    let quantity: number = 100000;
    if (form.watch("stockType") === "stock") {
      if (orderType === "dyeing") {
        quantity = getGrayFabricStock(grayFabricId);
      }
      if (orderType === "purchase") {
        quantity = product.externalStock;
      }
    }
    return quantity;
  };

  const onSubmit = (data: OrderInputs) => {
    if (orderType === "dyeing") {
      data.stockType === "stock" && orderFabricDyeingFromStock(data);
      data.stockType === "ranning" && orderFabricDyeingFromRanning(data);
    } else if (orderType === "purchase") {
      orderFabricPurchase(data, data.stockType);
    }
    onClose();
  };
  return (
    <Box>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack spacing={6}>
          {orderType === "dyeing" && (
            <Controller
              control={form.control}
              name="stockType"
              rules={{ required: true }}
              render={({ field: { ref, value, ...restField } }) => (
                <RadioGroup mt={3} {...restField}>
                  <Stack direction="column">
                    <Radio value="ranning">メーカーの定番キバタから加工</Radio>
                    {product.grayFabricId && (
                      <Radio value="stock">キバタ在庫から加工</Radio>
                    )}
                  </Stack>
                </RadioGroup>
              )}
            />
          )}

          {orderType === "purchase" && (
            <>
              <Controller
                control={form.control}
                name="stockType"
                rules={{ required: true }}
                render={({ field: { ref, value, ...restField } }) => (
                  <RadioGroup mt={3} {...restField}>
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
                          （別染メーカー保管在庫）
                        </Box>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                )}
              />
              <Box w="100%">
                <Text>送り先名</Text>
                <Select
                  mt={1}
                  placeholder="送り先を選択してください"
                  defaultValue="徳島工場"
                  {...form.register("stockPlace")}
                >
                  {stockPlaces?.map((place) => (
                    <option key={place.id} value={place.name}>
                      {place.name}
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
                defaultValue={getTodayDate()}
                {...form.register("orderedAt")}
              />
            </Box>
            <Box w="100%">
              <Box>入荷予定日</Box>
              <Input
                mt={1}
                type="date"
                defaultValue={getTodayDate()}
                {...form.register("scheduledAt")}
              />
            </Box>
          </Flex>
          <Flex gap={3} w="100%" flexDirection={{ base: "column", md: "row" }}>
            <Box w="100%">
              <Text>価格（円）</Text>
              <Controller
                control={form.control}
                name="price"
                defaultValue={Number(product.price)}
                rules={{ required: true }}
                render={({ field: { ref, value, ...restField } }) => (
                  <NumberInput
                    mt={1}
                    w="100%"
                    min={0}
                    max={10000}
                    defaultValue={Number(product.price)}
                    {...restField}
                  >
                    <NumberInputField ref={ref} textAlign="right" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
            </Box>
            <Box w="100%">
              <Text>数量（m）</Text>
              <Controller
                control={form.control}
                name="quantity"
                defaultValue={0}
                rules={{ required: true, min: 1 }}
                render={({ field: { ref, value, ...restField } }) => (
                  <NumberInput
                    mt={1}
                    w="100%"
                    min={0}
                    max={getLimitQuantity()}
                    defaultValue={0}
                    {...restField}
                  >
                    <NumberInputField ref={ref} textAlign="right" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
            </Box>
          </Flex>
          <Box>
            <Text>
              使用目的
              <Box as="span" color="red" fontSize="xs" ml={2}>
                ※ 顧客名、用途を必ず記入してください
              </Box>
            </Text>
            <Textarea
              minLength={1}
              {...form.register("comment", { required: true, maxLength: 1000 })}
            />
          </Box>
          {orderType === "dyeing" && (
            <Button
              size="md"
              colorScheme="facebook"
              type="submit"
              disabled={isLimit("dyeing")}
            >
              登録
            </Button>
          )}
          {orderType === "purchase" && (
            <Button
              size="md"
              colorScheme="facebook"
              type="submit"
              disabled={isLimit("purchase")}
            >
              登録
            </Button>
          )}
        </Stack>
      </form>
    </Box>
  );
};
