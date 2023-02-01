import {
  Box,
  Flex,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from "@chakra-ui/react";
import { NextPage } from "next";
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { productsState } from "../../../store";
import { CuttingReportType } from "../../../types/CuttingReportType";

type Props = {
  items: CuttingReportType;
  setItems: Function;
  content: any;
  rowIndex: number;
};

export const FabricsUsedInput: NextPage<Props> = ({
  items,
  setItems,
  content,
  rowIndex,
}) => {
  const products = useRecoilValue(productsState);

  const handleInputsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems(() => {
      let newArray: any = [];
      newArray = items.contents.map((content: any, index) =>
        index === rowIndex ? { ...content, [name]: value } : content
      );
      return { ...items, contents: [...newArray] };
    });
  };

  const handleNumbersChange = (e: string, name: string, rowIndex: number) => {
    const value = e;
    setItems(() => {
      let newArray: any = [];
      newArray = items.contents.map((content: any, index) =>
        index === rowIndex ? { ...content, [name]: value } : content
      );
      return { ...items, contents: [...newArray] };
    });
  };

  const scaleCalc = (meter: number, quantity: number) => {
    const value = meter / quantity;
    return value ? value.toFixed(2) : "";
  };

  console.log(items);
  return (
    <>
      <Box>
        <Text fontWeight="bold">使用生地</Text>
        <Box mt={1} p={3} border="1px" borderColor="gray.200">
          <Flex gap={3} w="full">
            <Box flex="1">
              <Text fontWeight="bold">品名</Text>
              <Input
                mt={1}
                type="text"
                name="productId"
                placeholder="生地を選択"
                list="search"
                value={content?.productId}
                onChange={(e) => handleInputsChange(e, rowIndex)}
                autoComplete="off"
              />
              <datalist id="search">
                {products.map((product: any, index: number) => (
                  <option key={index} value={product.productNumber}>
                    {product.productName}
                    {product.colorName}
                  </option>
                ))}
              </datalist>
            </Box>

            <Box>
              <Text fontWeight="bold">数量（m）</Text>
              <NumberInput
                mt={1}
                name="quantity"
                defaultValue={0}
                min={0}
                max={10000}
                value={content?.quantity}
                onChange={(e) => handleNumbersChange(e, "quantity", rowIndex)}
              >
                <NumberInputField textAlign="right" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
            <Box>
              <Text fontWeight="bold">用尺（m）</Text>
              <Input
                mt={1}
                type="text"
                textAlign="right"
                readOnly
                value={scaleCalc(
                  items?.contents[rowIndex].quantity,
                  items.totalQuantity
                )}
              />
            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  );
};
