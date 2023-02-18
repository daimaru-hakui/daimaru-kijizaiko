import { Box, Container, Flex, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import { useRecoilValue } from "recoil";
import { grayFabricsState } from "../../../store";

type Props = {
  product: any
};

const DisplayStock: NextPage<Props> = ({ product }) => {
  const grayFabrics = useRecoilValue(grayFabricsState);

  const getGrayFabric = (grayFabricId: string, type: string) => {
    const result = grayFabrics.find(
      (grayFabric: { id: string }) => grayFabric.id === grayFabricId
    );
    if (type === "wip") return result?.wip;
    if (type === "stock") return result?.stock;
  };

  return (
    <Container maxW="600px" p={0}>
      <Flex gap={3} justifyContent="space-between">
        {product.grayFabricId && (
          <Flex w="100%" gap={3} flexDirection="column">
            <Box w="100%" p={2} textAlign="center" bg="#f36450" boxShadow="md">
              <Text fontSize="sm">キバタ仕掛</Text>
              <Box>
                <Box as="span" fontSize="2xl">
                  {getGrayFabric(product.grayFabricId, "wip") || 0}
                </Box>
                m
              </Box>
            </Box>
            <Box w="100%" p={2} textAlign="center" bg="#5090f3" boxShadow="md">
              <Text fontSize="sm">キバタ在庫</Text>
              <Box>
                <Box as="span" fontSize="2xl">
                  {getGrayFabric(product.grayFabricId, "stock") || 0}
                </Box>
                m
              </Box>
            </Box>
          </Flex>
        )}
        <Flex w="100%" gap={3} flexDirection="column">
          <Box w="100%" p={2} textAlign="center" bg="#f3c150" boxShadow="md">
            <Text fontSize="sm">生地仕掛</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                {product?.wip || 0}
              </Box>
              m
            </Box>
          </Box>
          <Box w="100%" p={2} textAlign="center" bg="#a58acf" boxShadow="md">
            <Text fontSize="sm">外部在庫</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                {product?.externalStock || 0}
              </Box>
              m
            </Box>
          </Box>
        </Flex>
        <Flex w="100%" gap={3} flexDirection="column">
          <Box w="100%" p={2} textAlign="center" bg="#59b99d" boxShadow="md">
            <Text fontSize="sm">入荷待ち</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                {product?.arrivingQuantity || 0}
              </Box>
              m
            </Box>
          </Box>
          <Box w="100%" p={2} textAlign="center" bg="#54d1de" boxShadow="md">
            <Text fontSize="sm">徳島在庫</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                {product?.tokushimaStock || 0}
              </Box>
              m
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Container>
  );
};

export default DisplayStock;
