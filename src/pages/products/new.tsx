import { Box, Container } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { ProductType } from "../../../types";
import ProductInputArea from "../../components/products/ProductInputArea";
import { NextPage } from "next";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";

const ProductsNew: NextPage = () => {
  const router = useRouter();
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
  // useEffect(() => {
  //   if (!router?.query?.id) return;
  //   const getProduct = async () => {
  //     const id = router?.query?.id;
  //     console.log(id);
  //     const docRef = doc(db, "products", `${id}`);
  //     const docSnap = await getDoc(docRef);
  //     setProduct({ ...docSnap.data() } as ProductType);
  //   };
  //   getProduct();
  // }, [router]);
  // console.log(product);
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
        <ProductInputArea
          title="生地の登録"
          pageType="new"
          product={product as ProductType}
        />
      </Container>
    </Box>
  );
};

export default ProductsNew;
