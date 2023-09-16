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
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useGrayFabricStore } from "../../../../store";
import { useUtil } from "../../../hooks/UseUtil";
import { GrayFabric } from "../../../../types";
import { NextPage } from "next";
import { AdjustmentGrayFabricTable } from "../../../components/adjustment/AdjustmentGrayFabricTable";

const AdjustmentGrayFabrics: NextPage = () => {
  const grayFabrics = useGrayFabricStore((state) => state.grayFabrics);
  const [filterGrayFabrics, setFilterGrayFabrics] = useState<GrayFabric[]>(null);
  const [searchText, setSearchText] = useState("");
  const { halfToFullChar } = useUtil();

  useEffect(() => {
    setFilterGrayFabrics(
      grayFabrics.filter((grayFabric) =>
        grayFabric.productNumber.includes(
          halfToFullChar(searchText.toUpperCase())
        )
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  if (filterGrayFabrics === null)
    return (
      <Flex w="full" h="100vh" justify="center" align="center">
        <Spinner />
      </Flex>
    );

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Container
        maxW="800px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
        maxH="calc(100vh - 100px)"
        overflow="hidden"
      >
        <Box as="h2" fontSize="2xl">
          キバタ在庫調整
        </Box>
        <AdjustmentGrayFabricTable
          filterGrayFabrics={filterGrayFabrics}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </Container>
    </Box>
  );
};

export default AdjustmentGrayFabrics;
