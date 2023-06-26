import {
  Box,
  Button,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import { ScheduleModal } from "../../components/schedules/ScheduleModal";
import { useCuttingScheduleStore } from "../../../store";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { arrayRemove, doc, runTransaction } from "firebase/firestore";
import { db } from "../../../firebase";
import { CuttingSchedule } from "../../../types";

const Schedules = () => {
  const { getUserName, getProductNumber, getColorName } = useGetDisp();
  const cuttingSchedules = useCuttingScheduleStore(
    (state) => state.cuttingSchedules
  );

  const deleteSchedule = async (data: CuttingSchedule) => {
    const result = confirm("削除して宜しいでしょうか");
    if (!result) return;
    const scheduleRef = doc(db, "cuttingSchedules", `${data.id}`);
    const productRef = doc(db, "products", `${data?.productId}`);
    try {
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(scheduleRef);
        if (!docSnap.exists) {
          throw "データが登録されていません。";
        }
        console.log(data);
        transaction.update(productRef, {
          cuttingSchedules: arrayRemove(data?.productId),
        });
        transaction.delete(scheduleRef);
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box
        w="full"
        maxW="850px"
        h="calc(100vh - 100px)"
        my={6}
        mx="auto"
        rounded="md"
        bg="white"
        boxShadow="md"
        overflow="hidden"
      >
        <Flex
          p={6}
          flexDirection="column"
          gap={3}
          align="center"
          justify="space-between"
          direction={{ base: "column", md: "row" }}
        >
          <Flex
            align="center"
            justifyContent="space-between"
            textAlign="left"
            w="full"
          >
            <Box as="h2" fontSize="2xl">
              使用予定一覧
            </Box>
            <Box>
              <ScheduleModal title="新規" mode="new" />
            </Box>
          </Flex>

          <TableContainer mt={6}>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>担当</Th>
                  <Th>加工指示書NO.</Th>
                  <Th>生地品番</Th>
                  <Th>アイテム名</Th>
                  <Th isNumeric>使用予定（m）</Th>
                  <Th>製品納期</Th>
                  <Th>処理</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cuttingSchedules.map((schedule) => (
                  <Tr key={schedule.id}>
                    <Td>{getUserName(schedule.staff)}</Td>
                    <Td>{schedule.processNumber}</Td>
                    <Td>
                      {getProductNumber(schedule.productId)}{" "}
                      {getColorName(schedule.productId)}
                    </Td>
                    <Td>{schedule.itemName}</Td>
                    <Td isNumeric>{schedule?.quantity}</Td>
                    <Td>{schedule.scheduledAt}</Td>
                    <Td>
                      <Flex gap={3}>
                        {/* <ScheduleModal title="編集" mode="edit" size="sm" /> */}
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => deleteSchedule(schedule)}
                        >
                          削除
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Box>
    </Box>
  );
};

export default Schedules;
