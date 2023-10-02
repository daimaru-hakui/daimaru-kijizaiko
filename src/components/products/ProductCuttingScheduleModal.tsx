import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import React, { FC, useEffect, useState } from "react";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useCuttingScheduleStore } from "../../../store";
import { useCuttingSchedules } from "../../hooks/useCuttingSchedules";
import { FaTrashAlt } from "react-icons/fa";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { useUtil } from "../../hooks/UseUtil";

type Props = {
  scheduleList: string[];
};

export const ProductCuttingScheduleModal: FC<Props> = ({ scheduleList }) => {
  const { getUserName, getProductNumber, getColorName } = useGetDisp();
  const {mathRound2nd} =useUtil()
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = useState([]);
  const [sum, setSum] = useState(0);
  const cuttingSchedules = useCuttingScheduleStore(
    (state) => state.cuttingSchedules
  );
  const { deleteSchedule } = useCuttingSchedules();
  const {isAuths} = useAuthManagement()

  useEffect(() => {
    const getSchedules = (array: string[]) => {
      const filterSchedules = cuttingSchedules.filter((schedule) =>
        array?.includes(schedule.id)
      );
      setData(filterSchedules);
    };
    getSchedules(scheduleList);
  }, [scheduleList, cuttingSchedules]);

  useEffect(() => {
    let total = 0;
    data.forEach((data) => (total += data.quantity));
    setSum(mathRound2nd(total));
  }, [data,mathRound2nd]);

  // console.log(sum)

  return (
    <>
      <Button colorScheme="facebook" size="xs" onClick={onOpen}>
        あり
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>使用予定</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box fontSize="lg" textAlign="right" mr={6}>
              使用予定合計 {sum} m
            </Box>
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
                    <Th>削除</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.map(
                    ({
                      id,
                      staff,
                      processNumber,
                      itemName,
                      productId,
                      quantity,
                      scheduledAt,
                    }) => (
                      <Tr key={id}>
                        <Td>{getUserName(staff)}</Td>
                        <Td>{processNumber}</Td>
                        <Td>
                          {getProductNumber(productId)}{" "}
                          {getColorName(productId)}
                        </Td>
                        <Td>{itemName}</Td>
                        <Td isNumeric>{quantity}</Td>
                        <Td>{scheduledAt}</Td>
                        <Td>
                          {isAuths(["tokushima"]) && (
                            <FaTrashAlt
                              cursor="pointer"
                              onClick={() => deleteSchedule(id, productId)}
                            />
                          )}
                        </Td>
                      </Tr>
                    )
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
