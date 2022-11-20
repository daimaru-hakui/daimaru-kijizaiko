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
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { ProductType } from '../../../types/productType';

type Props = {
  product: ProductType;
  orderType: number;
};

const OrderInputArea: NextPage<Props> = ({ product, orderType }) => {
  const [items, setItems] = useState({
    quantity: 0,
    date: '',
    comment: '',
    abc: 1,
  });

  const todayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  const handleRadioChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  return (
    <Box>
      <Stack spacing={6}>
        {orderType === 2 && (
          <RadioGroup
            mt={3}
            onChange={(e) => handleRadioChange(e, 'abc')}
            value={items.abc}
          >
            <Stack direction={{ base: 'column', md: 'row' }}>
              <Radio value={1}>生機在庫から使用</Radio>
              <Radio value={2}>ランニング生機から使用</Radio>
            </Stack>
          </RadioGroup>
        )}

        <Flex gap={3} w='100%'>
          <Box w='100%'>
            <Box>日付</Box>
            <Input
              mt={1}
              type='date'
              name='date'
              value={items.date || todayDate()}
              onChange={handleInputChange}
            />
          </Box>
          <Box w='100%'>
            <Text>数量（m）</Text>
            <NumberInput
              mt={1}
              w='100%'
              name='quantity'
              defaultValue={0}
              min={0}
              max={10000}
              value={items.quantity === 0 ? '' : items.quantity}
              onChange={(e) => handleNumberChange(e, 'quantity')}
            >
              <NumberInputField textAlign='right' />
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
            name='comment'
            value={items.comment}
            onChange={handleInputChange}
          />
        </Box>
        <Button size='md' colorScheme='facebook'>
          登録
        </Button>
      </Stack>
    </Box>
  );
};

export default OrderInputArea;
