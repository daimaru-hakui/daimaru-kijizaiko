import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportModal from "../../../components/tokushima/CuttingReportModal";
import { useCuttingReportFunc } from "../../../hooks/UseCuttingReportFunc";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { useUtil } from "../../../hooks/UseUtil";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import useSearch from "../../../hooks/UseSearch";

const CuttingReport = () => {
  const { getTodayDate } = useUtil();

  const { getSerialNumber, getUserName } = useGetDisp();
  const { items, setItems, startDay, endDay, staff, client, SearchExtElement, onSearch, onReset } = useSearch();
  const { data: cuttingReports } = useSWR(`/api/cutting-reports/${startDay}/${endDay}?staff=${staff}&client=${client}`);
  const { data: users } = useSWRImmutable(`/api/users/sales`);
  const { csvData } = useCuttingReportFunc(null, null, startDay, endDay);

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} p={6} bg="white" boxShadow="md" rounded="md">
        <Stack spacing={8}>
          <Flex alignItems="center" justifyContent="space-between">
            <Box as="h2" fontSize="2xl">
              裁断報告書
            </Box>
            <CSVLink data={csvData} filename={`裁断報告書_${getTodayDate()}`}>
              <Button size="sm">CSV</Button>
            </CSVLink>
          </Flex>

          <Flex
            w="full"
            gap={6}
            flexDirection={{ base: "column", lg: "row" }}>
            <SearchExtElement />
            <Box>
              <Heading as="h4" fontSize="md">
                受注先名を検索
              </Heading>
              <Flex
                mt={3}
                gap={3}
                alignItems="center"
                w={{ base: "full" }}
                flexDirection={{ base: "column", lg: "row" }}
              >
                <Input
                  w="full"
                  name="client"
                  value={items.client}
                  placeholder="受注先名を検索"
                  onChange={(e) => setItems({ ...items, client: e.target.value })}
                />
              </Flex>
            </Box>
            <Box>
              <Heading as="h4" fontSize="md">
                担当者を選択
              </Heading>
              <Flex
                mt={3}
                gap={3}
                alignItems="center"
                w="full"
                flexDirection={{ base: "column", lg: "row" }}
              >
                <Select
                  name="staff"
                  value={items.staff}
                  placeholder="担当者を選択"
                  onChange={(e) => setItems({ ...items, staff: e.target.value })}
                >
                  {users?.contents?.map((user) => (
                    <option key={user.id} value={user.id}>{getUserName(user.id)}</option>
                  ))}
                </Select>
                <Button
                  w={{ base: "full", lg: "80px" }}
                  px={6}
                  colorScheme="facebook"
                  onClick={onSearch}
                >
                  検索
                </Button>
                <Button
                  w={{ base: "full", lg: "80px" }}
                  px={6}
                  variant="outline"
                  onClick={onReset}
                >
                  クリア
                </Button>
              </Flex>
            </Box>
          </Flex>

          <TableContainer p={3} w="100%">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>詳細</Th>
                  <Th>裁断報告書NO.</Th>
                  <Th>裁断日</Th>
                  <Th>加工指示書NO.</Th>
                  <Th>品名</Th>
                  <Th>受注先名</Th>
                  <Th>数量</Th>
                  <Th>担当者名</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cuttingReports?.contents?.map((report: CuttingReportType) => (
                  <Tr key={report.serialNumber}>
                    <Td>
                      <CuttingReportModal
                        reportId={report.id}
                        startDay={startDay}
                        endDay={endDay}
                        staff={staff}
                        client={client}
                      />
                    </Td>
                    <Td>{getSerialNumber(report.serialNumber)}</Td>
                    <Td>{report.cuttingDate}</Td>
                    <Td>{report.processNumber}</Td>
                    <Td>{report.itemName}</Td>
                    <Td>{report.client}</Td>
                    <Td isNumeric>{report.totalQuantity.toLocaleString()}</Td>
                    <Td>{getUserName(report.staff)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Stack>
      </Box>
    </Box>
  );
};

export default CuttingReport;
