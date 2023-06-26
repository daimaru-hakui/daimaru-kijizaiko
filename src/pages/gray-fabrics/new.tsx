import { Box, Container } from "@chakra-ui/react";
import { NextPage } from "next";
import { useState } from "react";
import { GrayFabricForm } from "../../components/grayFabrics/GrayFabricForm";

const GrayFabricsNew: NextPage = () => {
  const [grayFabric, setGrayFabric] = useState({
    id: "",
    supplierId: "",
    productNumber: "",
    productName: "",
    price: 0,
    comment: "",
    wip: 0,
    stock: 0,
    createUser: "",
  });
  return (
    <Box w="full" mt={12} px={6}>
      <Container
        maxW="800px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Box as="h1" fontSize="2xl">
          キバタ登録
        </Box>
        <GrayFabricForm
          title="登録"
          grayFabric={grayFabric}
          toggleSwitch="new"
        />
      </Container>
    </Box>
  );
};

export default GrayFabricsNew;
