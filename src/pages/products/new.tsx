import {
  Box,
  Checkbox,
  CheckboxGroup,
  Container,
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
} from '@chakra-ui/react';
import React, { useState } from 'react';
import MaterialsModal from '../../components/products/MaterialsModal';

const ProductsNew = () => {
  const [items, setItems] = useState<any>({});

  const features = [
    '制電',
    '制菌',
    '抗菌',
    '撥水',
    '防水',
    '吸汗',
    '速乾',
    '涼感',
    '接触冷感',
    'ストレッチ',
  ];

  const handleSelectchange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    name: string
  ) => {
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  return (
    <Container maxW='800px' p={6} bg='white' rounded='md'>
      <Box as='h1' fontSize='2xl'>
        生地の登録
      </Box>
      <Stack spacing={6} mt={6}>
        <Flex gap={6}>
          <Box w='100%'>
            <Text>メーカー名</Text>
            <Select
              placeholder='メーカーを選択してください'
              onChange={(e) => handleSelectchange(e, 'maker')}
            >
              <option>クラボウインターナショナル</option>
            </Select>
          </Box>
        </Flex>
        <Flex gap={6} alignItems='center' justifyContent='space-between'>
          <Box w='100%' flex='1'>
            <Text>品番</Text>
            <Input
              name='productNum'
              type='text'
              placeholder='例）M2000 '
              onChange={handleInputChange}
            />
          </Box>
          <Box w='100%' flex='1'>
            <Text>色番</Text>
            <Input
              name='colorNum'
              type='text'
              placeholder='例）G-1'
              onChange={handleInputChange}
            />
          </Box>
          <Box w='100%' flex='1'>
            <Text>色</Text>
            <Input
              name='colorName'
              type='text'
              placeholder='例）晒'
              onChange={handleInputChange}
            />
          </Box>
        </Flex>
        <Flex gap={6} alignItems='center' justifyContent='space-between'>
          <Box flex={2}>
            <Text>品名</Text>
            <Input
              name='productName'
              type='text'
              placeholder='例）アーバンツイル'
              onChange={handleInputChange}
            />
          </Box>
          <Box flex={1}>
            <Text>単価（円）</Text>
            <NumberInput name='price' defaultValue={0} min={0} max={10000}>
              <NumberInputField textAlign='right' />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        </Flex>

        <Divider />

        <Flex
          gap={6}
          w='100%'
          alignItems='flex-start'
          justifyContent='space-between'
        >
          <Stack spacing={6} flex={1}>
            <Box w='100%'>
              <Text>組織</Text>
              <Select
                placeholder='組織を選択してください'
                onChange={(e) => handleSelectchange(e, 'maker')}
              >
                <option>ツイル</option>
              </Select>
            </Box>
            <Box w='100%'>
              <Text>規格（巾）cm</Text>
              <NumberInput defaultValue={150} min={0} max={200}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
            <Box w='100%'>
              <Text>規格（長さ）m</Text>
              <NumberInput defaultValue={50} min={0} max={200}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </Stack>
          <Flex flex={1} gap={6}>
            <Box w='100%'>
              <Text>混率</Text>

              {items.materials && (
                <Box p={3} rounded='md' border='1px' borderColor='gray.100'>
                  <Stack spacing={3}>
                    {items.materials?.t && (
                      <Text>ポリエステル {items.materials?.t}%</Text>
                    )}
                    {items.materials?.c && (
                      <Text>綿 {items.materials?.c}%</Text>
                    )}
                    {items.materials?.pu && (
                      <Text>ポリウレタン {items.materials?.pu}%</Text>
                    )}
                  </Stack>
                </Box>
              )}
              <MaterialsModal items={items} setItems={setItems} />
            </Box>
          </Flex>
        </Flex>

        <Box w='100%'>
          <Text>機能性</Text>
          <CheckboxGroup
            colorScheme='green'
            defaultValue={['naruto', 'kakashi']}
          >
            <Flex
              wrap='wrap'
              m={1}
              rounded='md'
              border='1px'
              borderColor='gray.100'
            >
              {features.map((f) => (
                <Checkbox key={f} value={f} mt={2} mx={2} mb={2}>
                  {f}
                </Checkbox>
              ))}
            </Flex>
          </CheckboxGroup>
        </Box>
      </Stack>
    </Container>
  );
};

export default ProductsNew;
