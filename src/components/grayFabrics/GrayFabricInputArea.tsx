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

import { NextPage } from "next";
import React from "react";
import { useRecoilValue } from "recoil";
import { grayFabricsState, suppliersState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";

type Props = {
  grayFabric: GrayFabricType | undefined;
  items: GrayFabricType;
  setItems: Function;
  onClick: Function;
  btnTitle: string;
};

const GrayFabricInputArea: NextPage<Props> = ({
  grayFabric,
  items,
  setItems,
  onClick,
  btnTitle,
}) => {
  const suppliers = useRecoilValue(suppliersState);
  const grayFabrics = useRecoilValue(grayFabricsState);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleSelectchange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    name: string
  ) => {
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  // 登録済みを登録できなくする
  const isRegistered = (
    prevProductNumber: string = "",
    currentProductNumber: string,
    currentSupplierId: string
  ) => {
    let result = grayFabrics.filter(
      (grayFabric: GrayFabricType) =>
        grayFabric.productNumber === currentProductNumber &&
        grayFabric.supplierId === currentSupplierId
    );
    if (btnTitle === "更新") {
      result = result?.filter(
        (grayFabric: GrayFabricType) =>
          prevProductNumber !== currentProductNumber
      );
      return result.length >= 1 ? true : false;
    }
    return result.length >= 1 ? true : false;
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
              display={btnTitle === "登録" ? "display" : "none"}
            >
              ※必須
            </Box>
          </Text>
          <Select
            mt={1}
            placeholder="メーカーを選択してください"
            value={items.supplierId}
            onChange={(e) => handleSelectchange(e, "supplierId")}
          >
            {suppliers?.map((supplier: { id: string; name: string }) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </Select>
        </Box>
      </Flex>
      <Box
        fontSize="lg"
        fontWeight="bold"
        color="red"
        display={
          isRegistered(
            grayFabric?.productNumber,
            items.productNumber,
            items.supplierId
          )
            ? "block"
            : "none"
        }
      >
        すでに登録済みです。
      </Box>
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
              display={btnTitle === "登録" ? "display" : "none"}
            >
              ※必須
            </Box>
          </Text>
          <Input
            mt={1}
            name="productNumber"
            type="text"
            placeholder="例）AQSK2336 "
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
      <Button
        colorScheme="facebook"
        disabled={
          !items.supplierId ||
          !items.productNumber ||
          isRegistered(
            grayFabric?.productNumber,
            items.productNumber,
            items.supplierId
          )
        }
        onClick={() => onClick()}
      >
        {btnTitle}
      </Button>
    </Stack>
  );
};

export default GrayFabricInputArea;
