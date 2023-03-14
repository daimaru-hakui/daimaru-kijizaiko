import {
  Box,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { currentUserState, grayFabricsState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";
import GrayFabricEditModal from "../../components/grayFabrics/GrayFabricEditModal";
import CommentModal from "../../components/CommentModal";
import GrayFabricOrderAreaModal from "../../components/grayFabrics/GrayFabricOrderAreaModal";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useGrayFabricFunc } from "../../hooks/UseGrayFabricFunc";
import { useAuthManagement } from "../../hooks/UseAuthManagement";

const GrayFabrics = () => {
  const grayFabrics = useRecoilValue(grayFabricsState);
  const currentUser = useRecoilValue(currentUserState);
  const { isAuths } = useAuthManagement();
  const [filterGrayFabrics, setFilterGrayFabrics] = useState(
    [] as GrayFabricType[]
  );
  const { getSupplierName } = useGetDisp();
  const { deleteGrayFabric } = useGrayFabricFunc(null, null);

  useEffect(() => {
    const getFilterGrayFabrics = async () => {
      setFilterGrayFabrics(
        grayFabrics.filter((fabric: GrayFabricType) =>
          fabric.productNumber.includes("")
        )
      );
    };
    getFilterGrayFabrics();
  }, [grayFabrics]);

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} mx="auto" rounded="md" bg="white" boxShadow="md">
        <TableContainer p={6} w="100%">
          <Box as="h2" fontSize="2xl">
            キバタ一覧
          </Box>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>発注</Th>
                <Th>品番</Th>
                <Th>品名</Th>
                <Th>仕入先</Th>
                <Th w="100px">キバタ仕掛</Th>
                <Th w="100px">キバタ在庫</Th>
                <Th>コメント</Th>
                <Th>編集</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterGrayFabrics?.map((fabric: GrayFabricType) => (
                <Tr key={fabric.id}>
                  <Td>
                    <GrayFabricOrderAreaModal grayFabric={fabric} />
                  </Td>
                  <Td>{fabric.productNumber}</Td>
                  <Td>{fabric.productName}</Td>
                  <Td>{getSupplierName(fabric.supplierId)}</Td>
                  <Td
                    isNumeric
                    fontSize="md"
                    fontWeight={fabric.wip > 0 ? "bold" : "normal"}
                  >
                    {fabric.wip.toLocaleString() || 0}m
                  </Td>
                  <Td
                    isNumeric
                    fontSize="md"
                    fontWeight={fabric.stock > 0 ? "bold" : "normal"}
                  >
                    {fabric.stock.toLocaleString() || 0}m
                  </Td>
                  <Td w="100%">
                    <Flex gap={3}>
                      <CommentModal
                        id={fabric.id}
                        comment={fabric.comment}
                        collectionName="grayFabrics"
                      />
                      {fabric?.comment.slice(0, 10) +
                        (fabric?.comment.length >= 1 ? "..." : "")}
                    </Flex>
                  </Td>
                  <Td>
                    {(isAuths(["rd"]) ||
                      fabric?.createUser === currentUser) && (
                      <Flex alignItems="center" gap={3}>
                        <GrayFabricEditModal grayFabric={fabric} />
                        <FaTrashAlt
                          color="#444"
                          cursor="pointer"
                          onClick={() => deleteGrayFabric(fabric.id)}
                        />
                      </Flex>
                    )}
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

export default GrayFabrics;
