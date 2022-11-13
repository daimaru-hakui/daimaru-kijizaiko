import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
} from '@chakra-ui/react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import { colors, materialNames } from '../../../datalist';
import Link from 'next/link';

const Products = () => {
  const [products, setProducts] = useState<any>();

  useEffect(() => {
    const getProducts = async () => {
      const q = query(collection(db, 'products'), orderBy('productNum', 'asc'));
      try {
        onSnapshot(q, (querySnap) =>
          setProducts(
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          )
        );
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getProducts();
  }, []);

  const dispColor = (colorNum: number) => {
    const result = colors.find(
      (color: { id: number; name: string }) => color.id === colorNum
    );
    return result?.name;
  };

  const dispMaterialName = (materialName: number) => {
    const result = materialNames.find(
      (material: { id: number; name: string }) => material.id === materialName
    );
    return result?.name;
  };

  const dispMixed = (materials: any) => {
    const t = materials.t ? `ポリエステル${materials.t}% ` : '';
    const c = materials.c ? `綿${materials.c}% ` : '';
    const n = materials.n ? `ナイロン${materials.n}% ` : '';
    const r = materials.r ? `レーヨン${materials.r}% ` : '';
    const f = materials.f ? `麻${materials.f}% ` : '';
    const pu = materials.pu ? `ポリウレタン${materials.pu}% ` : '';
    const w = materials.w ? `ウール${materials.w}% ` : '';
    const ac = materials.ac ? `アクリル${materials.ac}% ` : '';
    const cu = materials.cu ? `キュプラ${materials.cu}% ` : '';
    const si = materials.si ? `シルク${materials.si}% ` : '';
    const z = materials.z ? `指定外繊維${materials.z}% ` : '';

    return t + c + n + r + f + pu + w + ac + cu + si + z;
  };

  const dispStd = (fabricWidth: number, fabricLength: number) => {
    const width = fabricWidth ? `巾:${fabricWidth}cm` : '';
    const length = fabricLength ? `長さ:${fabricLength}m` : '';
    const mark = width && length ? '×' : '';
    return `${width}${mark}${length}`;
  };

  return (
    <Box w='100%' my={6} rounded='md' bg='white' boxShadow='md'>
      <TableContainer p={6} maxW='100%'>
        <Box as='h2' fontSize='2xl'>
          生地品番一覧
        </Box>
        <Table mt={6} variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>詳細</Th>
              <Th>生地品番</Th>
              <Th>色</Th>
              <Th>品名</Th>
              <Th>単価</Th>
              <Th>徳島在庫</Th>
              <Th>外部在庫</Th>
              <Th>仕掛数量</Th>
              <Th>キープ数量</Th>
              <Th>組織名</Th>
              <Th>混率</Th>
              <Th>規格</Th>
              <Th>機能性</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products?.map(
              (product: {
                id: string;
                productNum: string;
                productName: string;
                colorNum: number;
                colorName: string;
                price: string;
                materialName: number;
                fabricWidth: number;
                fabricLength: number;
                materials: any;
              }) => (
                <Tr key={product.id}>
                  <Td>
                    <Link href={`/products/${product.id}`}>
                      <Button size='sm'>詳細</Button>
                    </Link>
                  </Td>
                  <Td>
                    {product.productNum}-{product.colorName}
                  </Td>

                  <Td>{dispColor(product?.colorNum)}</Td>
                  <Td>{product.productName}</Td>
                  <Td isNumeric>{product.price}円</Td>
                  <Td isNumeric>0m</Td>
                  <Td isNumeric>0m</Td>
                  <Td isNumeric>0m</Td>
                  <Td isNumeric>0m</Td>
                  <Td>{dispMaterialName(product.materialName)}</Td>
                  <Td isNumeric>
                    {dispStd(product.fabricWidth, product.fabricLength)}
                  </Td>
                  <Td isNumeric>{dispMixed(product.materials)}</Td>

                  <Td>防汚・制電</Td>
                </Tr>
              )
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Products;
