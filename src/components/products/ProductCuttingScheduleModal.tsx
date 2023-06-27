import {
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

type Props = {
  scheduleList: string[];
};

export const ProductCuttingScheduleModal: FC<Props> = ({ scheduleList }) => {
  const { getUserName, getProductNumber, getColorName } = useGetDisp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = useState([]);
  const cuttingSchedules = useCuttingScheduleStore(
    (state) => state.cuttingSchedules
  );

  useEffect(() => {
    const getSchedules = (array: string[]) => {
      const filterSchedules = cuttingSchedules.filter((schedule) =>
        array?.includes(schedule.id)
      );
      setData(filterSchedules);
    };
    getSchedules(scheduleList);
  }, [scheduleList, cuttingSchedules]);

  return (
    <>
      <Button colorScheme="facebook" size="xs" onClick={onOpen}>
        あり
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>使用予定</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
