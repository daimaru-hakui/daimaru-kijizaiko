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
import { deleteDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { grayFabricsState, suppliersState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";
import GrayFabricEditModal from "../../components/grayFabrics/GrayFabricEditModal";
import CommentModal from "../../components/CommentModal";
import GrayFabricOrderAreaModal from "../../components/grayFabrics/GrayFabricOrderAreaModal";

const GrayFabrics = () => {
  const grayFabrics = useRecoilValue(grayFabricsState);
  const suppliers = useRecoilValue(suppliersState);
  const [filterGrayFabrics, setFilterGrayFabrics] = useState([]);

  useEffect(() => {
    const getFilterGrayFabrics = async () => {
      setFilterGrayFabrics(
        await grayFabrics.filter((item: GrayFabricType) =>
          item.productNumber.includes("")
        )
      );
    };
    getFilterGrayFabrics();
  }, [grayFabrics]);

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(
      (supplier: { id: string }) => supplier.id === supplierId
    );
    return supplier?.name;
  };

  const deleteGrayFabric = async (id: string) => {
    let result = window.confirm("削除して宜しいでしょうか。");
    if (!result) return;

    result = window.confirm("本当に削除して宜しいでしょうか。");
    if (!result) return;

    const docRef = doc(db, "grayFabrics", id);
    await deleteDoc(docRef);
  };
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
              {filterGrayFabrics?.map((item: GrayFabricType) => (
                <Tr key={item.id}>
                  <Td>
                    <GrayFabricOrderAreaModal grayFabric={item} />
                  </Td>
                  <Td>{item.productNumber}</Td>
                  <Td>{item.productName}</Td>
                  <Td>{getSupplierName(item.supplierId)}</Td>
                  <Td
                    isNumeric
                    fontSize="md"
                    fontWeight={item.wip > 0 ? "bold" : "normal"}
                  >
                    {item.wip || 0}m
                  </Td>
                  <Td
                    isNumeric
                    fontSize="md"
                    fontWeight={item.stock > 0 ? "bold" : "normal"}
                  >
                    {item.stock || 0}m
                  </Td>
                  <Td w="100%">
                    <Flex gap={3}>
                      <CommentModal
                        id={item.id}
                        comment={item.comment}
                        collectionName="grayFabrics"
                      />
                      {item?.comment.slice(0, 10) +
                        (item.comment.length >= 1 ? "..." : "")}
                    </Flex>
                  </Td>
                  <Td>
                    <Flex alignItems="center" gap={3}>
                      <GrayFabricEditModal grayFabric={item} />
                      {/* <FaTrashAlt
                        cursor="pointer"
                        onClick={() => deleteGrayFabric(item.id)}
                      /> */}
                    </Flex>
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
