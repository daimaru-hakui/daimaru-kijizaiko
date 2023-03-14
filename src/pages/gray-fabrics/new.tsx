import { Box, Container } from "@chakra-ui/react";
import { useState } from "react";
import { GrayFabricType } from "../../../types/GrayFabricType";
import GrayFabricInputArea from "../../components/grayFabrics/GrayFabricInputArea";

const GrayFabricsNew = () => {
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
    <Box w="100%" mt={12} px={6}>
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
        <GrayFabricInputArea
          title="登録"
          grayFabric={grayFabric as GrayFabricType}
          toggleSwitch="new"
          onClose={() => {}}
        />
      </Container>
    </Box>
  );
};

export default GrayFabricsNew;
