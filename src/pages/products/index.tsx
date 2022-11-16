import React, { useState, useEffect } from "react";
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
  Text,
  Flex,
} from "@chakra-ui/react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../../firebase";
import Link from "next/link";
import { useRecoilValue } from "recoil";
import { colorsState, materialNamesState } from "../../../store";

const Products = () => {
  const [products, setProducts] = useState<any>();
  const colors = useRecoilValue(colorsState);
  const materialNames = useRecoilValue(materialNamesState);

  useEffect(() => {
    const getProducts = async () => {
      const q = query(collection(db, "products"), orderBy("productNum", "asc"));
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

  const dispColor = (color: number | string) => {
    const result = colors.find(
      (c: { id: number; name: string }) => c.id === color
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
    let array = [];
    const t = materials.t ? `ポリエステル${materials.t}% ` : "";
    const c = materials.c ? `綿${materials.c}% ` : "";
    const n = materials.n ? `ナイロン${materials.n}% ` : "";
    const r = materials.r ? `レーヨン${materials.r}% ` : "";
    const f = materials.f ? `麻${materials.f}% ` : "";
    const pu = materials.pu ? `ポリウレタン${materials.pu}% ` : "";
    const w = materials.w ? `ウール${materials.w}% ` : "";
    const ac = materials.ac ? `アクリル${materials.ac}% ` : "";
    const cu = materials.cu ? `キュプラ${materials.cu}% ` : "";
    const si = materials.si ? `シルク${materials.si}% ` : "";
    const z = materials.z ? `指定外繊維${materials.z}% ` : "";
    array.push(t, c, n, r, f, pu, w, ac, cu, si, z);

    return array
      .filter((item) => item)
      .map((item) => <Text key={item}>{item}</Text>);
  };

  const dispStd = (
    fabricWidth: number,
    fabricLength: number,
    fabricWeight: number | null
  ) => {
    const width = fabricWidth ? `巾:${fabricWidth}cm` : "";
    const length = fabricLength ? `長さ:${fabricLength}m` : "";
    const weigth = fabricWeight ? `重さ:${fabricWeight}` : "";
    const mark = width && length ? "×" : "";
    return (
      <>
        <Text>{width}</Text>
        <Text>{mark}</Text>
        <Text>{length}</Text>
        <Text ml={3}>{weigth}</Text>
      </>
    );
  };

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} rounded="md" bg="white" boxShadow="md">
        <TableContainer p={6} w="100%">
          <Box as="h2" fontSize="2xl">
            生地品番一覧
          </Box>
          <Table mt={6} variant="simple" size="sm">
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
                  productNumber: string;
                  productName: string;
                  colorNum: number;
                  color: number;
                  price: string;
                  materialName: number;
                  fabricWidth: number;
                  fabricLength: number;
                  materials: any;
                  features: [];
                }) => (
                  <Tr key={product.id}>
                    <Td>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm">詳細</Button>
                      </Link>
                    </Td>
                    <Td>{product.productNumber}</Td>

                    <Td>{dispColor(product?.color)}</Td>
                    <Td>{product.productName}</Td>
                    <Td isNumeric>{product.price}円</Td>
                    <Td isNumeric>0m</Td>
                    <Td isNumeric>0m</Td>
                    <Td isNumeric>0m</Td>
                    <Td isNumeric>0m</Td>
                    <Td>{dispMaterialName(product.materialName)}</Td>
                    <Td>
                      <Flex gap={1}>{dispMixed(product.materials)}</Flex>
                    </Td>
                    <Td>
                      <Flex>
                        {dispStd(
                          product.fabricWidth,
                          product.fabricLength,
                          null
                        )}
                      </Flex>
                    </Td>

                    <Td>
                      <Flex gap={2}>
                        {product?.features.map((f, index) => (
                          <Text key={index}>{f}</Text>
                        ))}
                      </Flex>
                    </Td>
                  </Tr>
                )
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Products;
