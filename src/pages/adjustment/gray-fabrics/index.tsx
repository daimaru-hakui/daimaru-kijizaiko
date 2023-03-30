import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Flex,
  Container,
  Input,
} from "@chakra-ui/react";
import { GiCancel } from "react-icons/gi";
import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { grayFabricsState } from "../../../../store";
import { useUtil } from "../../../hooks/UseUtil";
import AdjustmentGrayFabric from "../../../components/adjustment/AdjustmentGrayFabric";
import { GrayFabricType } from "../../../../types";
import { NextPage } from "next";

const AdjustmentGrayFabrics: NextPage = () => {
  const grayFabrics = useRecoilValue(grayFabricsState);
  const [filterProducts, setFilterProducts] = useState([] as any);
  const [searchText, setSearchText] = useState("");
  const { halfToFullChar } = useUtil();

  useEffect(() => {
    setFilterProducts(
      grayFabrics.filter((grayFabric: GrayFabricType) =>
        grayFabric.productNumber.includes(
          halfToFullChar(searchText.toUpperCase())
        )
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setSearchText("");
  };

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Container
        maxW="800px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <TableContainer p={6} w="100%">
          <Box as="h2" fontSize="2xl">
            キバタ在庫調整
          </Box>
          <Flex mt={6} gap={1} alignItems="center">
            <Input
              type="text"
              size="xs"
              w="32"
              mr={1}
              value={searchText}
              placeholder="品番絞り込み"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <GiCancel cursor="pointer" onClick={reset} />
          </Flex>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>生地品番</Th>
                <Th>単価（円）</Th>
                <Th>キバタ仕掛(m)</Th>
                <Th>キバタ在庫(m)</Th>
                <Th>処理</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterProducts?.map((grayFabric: GrayFabricType) => (
                <AdjustmentGrayFabric
                  key={grayFabric.id}
                  grayFabric={grayFabric}
                />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default AdjustmentGrayFabrics;
