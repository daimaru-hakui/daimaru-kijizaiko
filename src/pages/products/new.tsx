import { Box, Container } from "@chakra-ui/react";
import { useState } from "react";
import { Product } from "../../../types";
import { ProductInputArea } from "../../components/products/ProductInputArea";
import { NextPage } from "next";

const ProductsNew: NextPage = () => {
  const [product, setProduct] = useState({
    id: "",
    productType: 0,
    staff: "",
    supplierId: "",
    supplierName: "",
    grayFabricId: "",
    productNumber: "",
    productNum: "",
    productName: "",
    colorNum: "",
    colorName: "",
    price: 0,
    materialName: "",
    materials: "",
    fabricWidth: 0,
    fabricWeight: 0,
    fabricLength: 0,
    features: [],
    noteProduct: "",
    noteFabric: "",
    noteEtc: "",
    interfacing: false,
    lining: false,
    cuttingSchedules:[],
    wip: 0,
    externalStock: 0,
    arrivingQuantity: 0,
    tokushimaStock: 0,
    locations: [],
    createUser: "",
    updateUser: "",
    createdAt: undefined,
    updatedAt: undefined,
  });

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
        <ProductInputArea title="生地の登録" pageType="new" product={product} />
      </Container>
    </Box>
  );
};

export default ProductsNew;
