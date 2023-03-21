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
import { useState } from "react";
import { CSVLink } from "react-csv";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportModal from "../../../components/tokushima/CuttingReportModal";
import { useCuttingReportFunc } from "../../../hooks/UseCuttingReportFunc";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { useUtil } from "../../../hooks/UseUtil";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { useForm } from "react-hook-form";

type Inputs = {
  start: string;
  end: string;
  client: string;
  staff: string;
};

const CuttingReport = () => {
  const { getSerialNumber, getUserName } = useGetDisp();
  const { getTodayDate, get3monthsAgo } = useUtil();
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const [client, setClient] = useState("");
  const { csvData } = useCuttingReportFunc(null, null, startDay, endDay);
  const { data: users } = useSWRImmutable(`/api/users/sales`);
  const { data: cuttingReports } = useSWR(`/api/cutting-reports/${startDay}/${endDay}?staff=${staff}&client=${client}`);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      start: startDay,
      end: endDay,
      staff: "",
      client: ''
    }
  });

  const onSubmit = (data: Inputs) => {
    setStartDay(data.start);
    setEndDay(data.end);
    setClient(data.client);
    setStaff(data.staff);
  };
  const onReset = () => {
    setStartDay(get3monthsAgo());
    setEndDay(getTodayDate());
    setStaff("");
    setClient("");
    reset();
  };

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
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex
              w="full"
              gap={6}
              flexDirection={{ base: "column", lg: "row" }}>
              <Box>
                <Heading as="h4" fontSize="md">
                  期間を選択
                </Heading>
                <Flex
                  mt={3}
                  gap={3}
                  alignItems="center"
                  flexDirection={{ base: "column", lg: "row" }}
                >
                  <Flex gap={3} w={{ base: "full", lg: "350px" }}>
                    <Input type="date" {...register("start")} />
                    <Input type="date" {...register("end")} />
                  </Flex>
                </Flex>
              </Box>
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
                  <Input w="full" placeholder="受注先名を検索" {...register("client")} />
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
                  <Select placeholder="担当者を選択" {...register("staff")}                  >
                    {users?.contents?.map((user) => (
                      <option key={user.id} value={user.id}>{getUserName(user.id)}</option>
                    ))}
                  </Select>
                  <Button
                    type="submit"
                    w={{ base: "full", lg: "80px" }}
                    px={6}
                    colorScheme="facebook"
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
          </form>

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
    </Box >
  );
};

export default CuttingReport;
