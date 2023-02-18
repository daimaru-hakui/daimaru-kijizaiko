import {
  Box,
  Button,
  Flex,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useEffect } from 'react';
import { NextPage } from "next";
import { useRecoilValue } from "recoil";
import { grayFabricsState, suppliersState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";
import { useGrayFabricFunc } from "../../hooks/UseGrayFabricFunc";
import { useInputGrayFabric } from "../../hooks/UseInputGrayFabric";

type Props = {
  title: string;
  grayFabric: GrayFabricType | undefined;
  toggleSwitch: string;
  onClose: Function;
};

const GrayFabricInputArea: NextPage<Props> = ({
  title,
  grayFabric,
  toggleSwitch,
  onClose
}) => {
  const suppliers = useRecoilValue(suppliersState);
  const grayFabrics = useRecoilValue(grayFabricsState);
  const { items, setItems, handleInputChange } = useInputGrayFabric();
  const { addGrayFabric, updateGrayFabric } = useGrayFabricFunc(items, setItems);

  useEffect(() => {
    setItems({ ...grayFabric } as GrayFabricType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grayFabric])

  // 生地が登録しているかのチェック
  const registeredInput = () => {
    let item = items?.productNumber
    if (item === "") {
      item = 'noValue';
    }
    const base = grayFabrics.map(
      (grayFabric: GrayFabricType) =>
        grayFabric.productNumber
    );
    const result = base?.includes(item);
    return result;
  };

  return (
    <Stack spacing={6} mt={6}>
      <Flex gap={6}>
        <Box w="100%">
          <Text fontWeight="bold">
            仕入先
            <Box
              ml={1}
              as="span"
              textColor="red"
              display={title === "登録" ? "display" : "none"}
            >
              ※必須
            </Box>
          </Text>
          <Select
            mt={1}
            placeholder="メーカーを選択してください"
            value={items.supplierId}
            name="supplierId"
            onChange={handleInputChange}
          >
            {suppliers?.map((supplier: { id: string; name: string }) => (
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
        <Box w="100%" flex="2">
          <Text fontWeight="bold">
            品番
            <Box
              ml={1}
              as="span"
              textColor="red"
              display={title === "登録" ? "display" : "none"}
            >
              ※必須
            </Box>
          </Text>
          <Input
            mt={1}
            name="productNumber"
            type="text"
            placeholder="例）AQSK2336"
            value={items.productNumber}
            onChange={handleInputChange}
          />
        </Box>
        <Box w="100%" flex="3">
          <Text fontWeight="bold">品名</Text>
          <Input
            mt={1}
            name="productName"
            type="text"
            placeholder="例）アクアクール"
            value={items.productName}
            onChange={handleInputChange}
          />
        </Box>
      </Flex>
      <Box>
        <Text fontWeight="bold">コメント</Text>
        <Textarea
          mt={1}
          name="comment"
          value={items.comment}
          onChange={handleInputChange}
        />
      </Box>
      {toggleSwitch === 'new' && (
        <Button
          colorScheme="facebook"
          disabled={
            !items.supplierId ||
            !items.productNumber ||
            registeredInput()
          }
          onClick={addGrayFabric}
        >
          登録
        </Button>
      )}

      {toggleSwitch === 'edit' && (
        <Button
          colorScheme="facebook"
          disabled={
            !items.supplierId ||
            !items.productNumber
          }
          onClick={() => {
            updateGrayFabric(grayFabric.id);
            onClose();
          }}
        >
          更新
        </Button>
      )}
    </Stack>
  );
};

export default GrayFabricInputArea;
