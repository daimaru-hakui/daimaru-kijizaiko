import { FC } from "react";
import { Box, Container, Divider, Flex, Text } from "@chakra-ui/react";
import { Product } from "../../../types";
import { useUtil } from "../../hooks/UseUtil";
import { useGrayFabricStore } from "../../../store";

type Props = {
  product: Product;
};

export const DisplayStock: FC<Props> = ({ product }) => {
  const grayFabrics = useGrayFabricStore((state) => state.grayFabrics);
  const { mathRound2nd } = useUtil();

  const getGrayFabric = (grayFabricId: string, type: string) => {
    const result = grayFabrics.find(
      (grayFabric) => grayFabric.id === grayFabricId
    );
    if (type === "wip") return result?.wip;
    if (type === "stock") return result?.stock;
  };

  const getTanQuentityEL = (item: number, fabricLength: number) =>
    item > 0 &&
    Number(fabricLength) > 0 &&
    Math.floor(item / Number(fabricLength)) > 0 && (
      <Box as="span" pl={0}>
        【{Math.floor(item / Number(fabricLength))}反{Math.floor(item % Number(fabricLength)) > 0 && ("+" + Math.floor(item % Number(fabricLength)) + "m")}】
      </Box>
    );

  return (
    <Container maxW="600px" p={0}>
      <Flex
        gap={3}
        justify="space-between"
        direction={{ base: "column", md: "row" }}
      >
        {product.grayFabricId && (
          <Flex w="100%" gap={3} direction={{ base: "row", md: "column" }}>
            <Box w="100%" p={2} textAlign="center" bg="#f36450" boxShadow="md">
              <Text fontSize="sm">キバタ仕掛</Text>
              <Box>
                <Box as="span" fontSize="2xl">
                  {mathRound2nd(
                    getGrayFabric(product.grayFabricId, "wip") || 0
                  )}
                </Box>
                m
                {getTanQuentityEL(
                  getGrayFabric(product.grayFabricId, "wip"),
                  product?.fabricLength
                )}
              </Box>
            </Box>
            <Box w="100%" p={2} textAlign="center" bg="#5090f3" boxShadow="md">
              <Text fontSize="sm">キバタ在庫</Text>
              <Box>
                <Box as="span" fontSize="2xl">
                  {mathRound2nd(
                    getGrayFabric(product.grayFabricId, "stock") || 0
                  )}
                </Box>
                m
                {getTanQuentityEL(
                  getGrayFabric(product.grayFabricId, "stock"),
                  product?.fabricLength
                )}
              </Box>
            </Box>
          </Flex>
        )}
        <Flex w="100%" gap={3} direction={{ base: "row", md: "column" }}>
          <Box w="100%" p={2} textAlign="center" bg="#f3c150" boxShadow="md">
            <Text fontSize="sm">染め仕掛</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                {mathRound2nd(product?.wip) || 0}
              </Box>
              m{getTanQuentityEL(product?.wip, product?.fabricLength)}
            </Box>
          </Box>
          <Box w="100%" p={2} textAlign="center" bg="#a58acf" boxShadow="md">
            <Text fontSize="sm">外部在庫</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                {mathRound2nd(product?.externalStock) || 0}
              </Box>
              m{getTanQuentityEL(product?.externalStock, product?.fabricLength)}
            </Box>
          </Box>
        </Flex>
        <Flex w="100%" gap={3} direction={{ base: "row", md: "column" }}>
          <Box w="100%" p={2} textAlign="center" bg="#59b99d" boxShadow="md">
            <Text fontSize="sm">入荷待ち</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                {mathRound2nd(product?.arrivingQuantity) || 0}
              </Box>
              m
              {getTanQuentityEL(
                product?.arrivingQuantity,
                product?.fabricLength
              )}
            </Box>
          </Box>
          <Box w="100%" p={2} textAlign="center" bg="#54d1de" boxShadow="md">
            <Text fontSize="sm">徳島在庫</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                {mathRound2nd(product?.tokushimaStock || 0)}
              </Box>
              m
              {getTanQuentityEL(product?.tokushimaStock, product?.fabricLength)}
            </Box>
          </Box>
        </Flex>
      </Flex>
      <Box my={3}>
        {Number(product?.fabricLength) !== 0 && (
          <Text fontSize="sm">※反数は参考値になります。</Text>
        )}
      </Box>
      <Divider />
    </Container>
  );
};
