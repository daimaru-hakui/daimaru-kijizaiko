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
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import Link from "next/link";
import { useRecoilValue } from "recoil";
import {
  colorsState,
  materialNamesState,
  productsState,
  usersState,
} from "../../../store";
import { FaTrashAlt } from "react-icons/fa";
import OrderAreaModal from "../../components/products/OrderAreaModal";
import { ProductType } from "../../../types/productType";

const Products = () => {
  const products = useRecoilValue(productsState);
  const colors = useRecoilValue(colorsState);
  const users = useRecoilValue(usersState);
  const materialNames = useRecoilValue(materialNamesState);

  // 混率の表示
  const displayMixed = (materials: any) => {
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

  // 担当者の表示
  const displayName = (userId: string) => {
    if (userId === "R&D") {
      return "R&D";
    } else {
      const user = users.find((user: { uid: string }) => userId === user.uid);
      return user?.name;
    }
  };

  // 規格の表示
  const displayStd = (
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

  const quantityBold = (quantity: number) => {
    return quantity > 0 ? "bold" : "normal";
  };

  // 削除
  const deleteProduct = async (id: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "products", `${id}`);
    await deleteDoc(docRef);
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
                <Th></Th>
                <Th>担当</Th>
                <Th>生地品番</Th>
                <Th>色</Th>
                <Th>品名</Th>
                <Th>単価</Th>
                <Th>生地仕掛</Th>
                <Th>外部在庫</Th>
                <Th>入荷待ち</Th>
                <Th>徳島在庫</Th>
                <Th>組織名</Th>
                <Th>混率</Th>
                <Th>規格</Th>
                <Th>機能性</Th>
                <Th>削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products?.map((product: ProductType) => (
                <Tr key={product.id}>
                  <Td>
                    <Flex alignItems="center" gap={3}>
                      <Link href={`/products/${product.id}`}>
                        <Button size="xs">詳細</Button>
                      </Link>
                      <OrderAreaModal product={product} buttonSize="xs" />
                    </Flex>
                  </Td>
                  <Td>{displayName(product.staff)}</Td>
                  <Td>{product.productNumber}</Td>

                  <Td>{product?.colorName}</Td>
                  <Td>{product?.productName}</Td>
                  <Td isNumeric>{product.price}円</Td>

                  <Td isNumeric fontWeight={quantityBold(product?.wip)}>
                    {product?.wip || 0}m
                  </Td>
                  <Td
                    isNumeric
                    fontWeight={quantityBold(
                      product?.stockFabricDyeingQuantity
                    )}
                  >
                    {product?.stockFabricDyeingQuantity || 0}m
                  </Td>
                  <Td
                    isNumeric
                    fontWeight={quantityBold(product?.shippingQuantity)}
                  >
                    {product?.shippingQuantity || 0}m
                  </Td>
                  <Td
                    isNumeric
                    fontWeight={quantityBold(product?.stockTokushimaQuantity)}
                  >
                    {product?.stockTokushimaQuantity || 0}m
                  </Td>
                  <Td>{product.materialName}</Td>
                  <Td>
                    <Flex gap={1}>{displayMixed(product.materials)}</Flex>
                  </Td>
                  <Td>
                    <Flex>
                      {displayStd(
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
                  <Td>
                    <FaTrashAlt
                      cursor="pointer"
                      onClick={() => deleteProduct(product.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Products;
