import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
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
import useSearch from "../../../hooks/UseSearch";

const CuttingReport = () => {
  const { getTodayDate } = useUtil();
  const [cuttingReports, setCuttingReports] = useState(
    [] as CuttingReportType[]
  );
  const { getSerialNumber, getUserName } = useGetDisp();
  const { items, setItems, startDay, endDay, staff, client, SearchExtElement, onSearch } = useSearch();
  const { data } = useSWR(`/api/cutting-reports/${startDay}/${endDay}?staff=${staff}&client=${client}`);
  const { csvData } = useCuttingReportFunc(null, null, startDay, endDay);

  useEffect(() => {
    setCuttingReports(
      data?.contents?.sort(
        (a: CuttingReportType, b: CuttingReportType) =>
          a.serialNumber > b.serialNumber && -1
      )
    );
  }, [data]);



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
            gap={6}
            alignItems="center"
            flexDirection={{ base: "column", md: "row" }}>
            <SearchExtElement />
            <Box w="full">
              <Heading as="h4" fontSize="md">
                受注先名を検索
              </Heading>
              <Flex
                mt={3}
                gap={3}
                alignItems="center"
                w={{ base: "full", md: "300px" }}
                flexDirection={{ base: "column", md: "row" }}
              >
                <Input
                  w="full"
                  name="client"
                  value={items.client}
                  placeholder="受注先名を検索"
                  onChange={(e) => setItems({ ...items, client: e.target.value })}
                />
                <Button
                  w={{ base: "full", md: "80px" }}
                  px={6}
                  colorScheme="facebook"
                  onClick={onSearch}
                >
                  検索
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
                {cuttingReports?.map((report: CuttingReportType) => (
                  <Tr key={report.serialNumber}>
                    <Td>
                      <CuttingReportModal
                        reportId={report.id}
                        startDay={startDay}
                        endDay={endDay}
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
