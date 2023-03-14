import { Box, Button, Container, Flex, Select, Stack, Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { productsState, stockPlacesState } from '../../../store';
import { ProductType } from '../../../types/FabricType';
import { useGetDisp } from '../../hooks/UseGetDisp';
import { useUtil } from '../../hooks/UseUtil';

const CompleteId = () => {
  const router = useRouter();
  const products = useRecoilValue(productsState);
  const [product, setProduct] = useState({} as ProductType);
  const quantity = router.query.quantity;
  const serialNumber = router.query.serialNumber;
  const stockPlace = useRecoilValue(stockPlacesState);
  const { getSerialNumber } = useGetDisp();
  const { getNow } = useUtil();
  const [items, setItems] = useState({ title: '発注書', stockPlace: '' });

  useEffect(() => {
    const product = products.find((product) => (
      router.query.productId === product.id
    ));
    setProduct(product);
  }, [products, router.query.productId]);

  const pdhDownloadHandler = () => {
    const target = document.getElementById('pdf-id');
    if (target === null) return;

    html2canvas(target, { scale: 2.5 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/svg', 1.0);
      let pdf = new jsPDF();
      pdf.addImage(imgData, 'SVG', 5, 10, canvas.width / 10, canvas.height / 9);
      pdf.save(`${serialNumber}.pdf`);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  console.log(items);
  return (
    <Box w="100%" mt={12} px={6}>
      <Container
        maxW="800px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Flex w="full" flexDirection="column" alignItems="center" fontSize="xl">
          <Box as="h1" mt={6} fontSize="3xl">登録が完了しました</Box>
          <Flex p={6} mt={6} flexDirection="column" alignItems="flex-start" border="1px" borderColor="gray.200">
            <Flex><Box>品番：{product?.productNumber}</Box><Box ml={3}>{product?.productName}</Box></Flex>
            <Box>数量：{quantity}m</Box>
          </Flex>
        </Flex>
      </Container>
      <Container
        maxW="800px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Select name="title" mt={6} placeholder='---' onChange={handleInputChange}>
          <option value='発注書'>発注書</option>
          <option value='出荷依頼'>出荷依頼</option>
        </Select>
        <Select name="stockPlace" mt={6} placeholder='送り先を選択' onChange={handleInputChange}>
          {stockPlace.map((place) => (
            <option key={place.id} value={place.name}>{place.name}</option>
          ))}
        </Select>
        <Flex justifyContent="center">
          <Button mt={6} onClick={pdhDownloadHandler}>発注書を作成</Button>
        </Flex>
      </Container>
      <Container
        id="pdf-id"
        maxW="800px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Stack spacing={6}>
          <Flex justifyContent="space-between" alignItems="center">
            <Box textAlign="left" fontSize="2xl">{product?.supplierName} 御中</Box>
            <Box>{getNow()}</Box>
          </Flex>
          <Flex flexDirection="column" alignItems="flex-end">
            <Box fontSize="xl">（株）大丸白衣</Box>
            <Box fontSize="base">TEL 06-6632-0891</Box>
            <Box fontSize="base">FAX 06-6641-9200</Box>
          </Flex>
          <Box textAlign="center" fontSize="3xl">{items.title}</Box>
          <TableContainer >
            <Table variant='simple' border="1px" >
              <Thead >
                <Tr>
                  <Th w="full" border="1px" >品番/商品名</Th>
                  <Th border="1px" >数量</Th>
                  <Th border="1px" >発注書NO.</Th>
                </Tr>
              </Thead>
              <Tbody >
                <Tr fontSize="xl" >
                  <Td border="1px">{product?.productNumber} {product?.productName}</Td>
                  <Td border="1px" isNumeric>{quantity}m</Td>
                  <Td border="1px" isNumeric>{getSerialNumber(Number(serialNumber))}</Td>
                </Tr>
              </Tbody>
            </Table>
            {items?.stockPlace && (

              <Table variant='simple' mt={2} border="1px" >
                <Thead >
                  <Tr>
                    <Th w="full" border="1px" >送り先</Th>
                    <Th border="1px" >住所</Th>
                    <Th border="1px" >TEL</Th>
                  </Tr>
                </Thead>
                <Tbody >
                  <Tr fontSize="sm" >
                    <Td border="1px">{items?.stockPlace}</Td>
                    {stockPlace.map((place) => (
                      items?.stockPlace === place?.name && (
                        <>
                          <Td border="1px" >{place?.address}</Td>
                          <Td border="1px" isNumeric>{place?.tel}</Td>
                        </>
                      )
                    ))}
                  </Tr>
                </Tbody>
              </Table>
            )}
          </TableContainer>
        </Stack>
      </Container>
    </Box >
  );
};

export default CompleteId;;