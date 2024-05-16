import {
  Box,
  Tr,
  Td,
  Text,
  Flex,
} from "@chakra-ui/react";
import React, { FC} from 'react';
import { FaTrashAlt } from "react-icons/fa";
import OrderAreaModal from "./OrderAreaModal";
import ProductModal from "./ProductModal";
import  ProductMenu  from "./ProductMenu";
import { ProductCuttingScheduleModal } from "./ProductCuttingScheduleModal";
import { Product } from "../../../types";
import { useProducts } from "../../hooks/useProducts";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { useAuthStore } from "../../../store";

type Props = {
  product: Product;
};


const ProductTableRow: FC<Props> = ({ product }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { deleteProduct } = useProducts();
  const {  getUserName,getMixed, getFabricStd, getCuttingScheduleTotal } =
  useGetDisp();
  const { mathRound2nd } = useUtil();
  const { isAuths } = useAuthManagement();
  return (
    <Tr>
      <Td>
        <Flex align="center" gap={3}>
        <ProductMenu product={product} />
          <ProductModal product={product} />
          <OrderAreaModal product={product} buttonSize="xs" /> 
        </Flex>
      </Td>
      <Td>{getUserName(product.staff)}</Td>
      <Td>{product.productNumber}</Td>
      <Td>{product?.colorName}</Td>
      <Td>{product?.productName}</Td>
      <Td>
        {product?.cuttingSchedules?.length > 0 && (
          <ProductCuttingScheduleModal
            scheduleList={product.cuttingSchedules}
          />
        )}
      </Td>
      
      <Td
        isNumeric
        fontWeight={product?.tokushimaStock ? "bold" : "normal"}
        color={
          product?.tokushimaStock <
            getCuttingScheduleTotal(product.cuttingSchedules) ? "red" : "inherit"
        }
      >
        <Flex>
          {mathRound2nd(
            product?.tokushimaStock || 0
          ).toLocaleString()}
          m
          {product.cuttingSchedules?.length > 0 && (
            <Box as="span" ml={2}>
              {`(${mathRound2nd(getCuttingScheduleTotal(
                product.cuttingSchedules
              ))}m)`}
            </Box>
          )}
        </Flex>
      </Td>
      <Td isNumeric>{product?.price.toLocaleString()}円</Td>
      <Td
        isNumeric
        fontWeight={product?.wip ? "bold" : "normal"}
      >
        {mathRound2nd(product?.wip || 0).toLocaleString()}m
      </Td>
      <Td
        isNumeric
        fontWeight={product?.externalStock ? "bold" : "normal"}
      >
        {mathRound2nd(
          product?.externalStock || 0
        ).toLocaleString()}
        m
      </Td>
      <Td
        isNumeric
        fontWeight={
          product?.arrivingQuantity ? "bold" : "normal"
        }
      >
        {mathRound2nd(
          product?.arrivingQuantity || 0
        ).toLocaleString()}
        m
      </Td>
     
      <Td>{product.materialName}</Td>
      <Td>
        <Flex gap={1}>
          {getMixed(product.materials).map(
            (material, index) => (
              <Text key={index}>{material}</Text>
            )
          )}
        </Flex>
      </Td>
      <Td>
        <Flex>
          {getFabricStd(
            product.fabricWidth,
            product.fabricLength,
            product.fabricWeight
          )}
        </Flex>
      </Td>
      <Td>
        <Flex gap={2}>
          {product.features.map((feature, index) => (
            <Text key={index}>{feature}</Text>
          ))}
        </Flex>
      </Td>
      <Td>
        {(isAuths(["rd"]) ||
          product?.createUser === currentUser) && (
            <FaTrashAlt
              cursor="pointer"
              onClick={() => deleteProduct(product.id)}
            />
          )}
      </Td>
    </Tr>
  );
};

export default React.memo(ProductTableRow)
