import { Box, Container } from "@chakra-ui/react";
import { useState } from "react";
import { CuttingReportType } from "../../../../types";
import CuttingReportInputArea from "../../../components/tokushima/CuttingReportInputArea";
import { useUtil } from "../../../hooks/UseUtil";

const CuttingReportNew = () => {
  const { getTodayDate } = useUtil();

  const [report, setReport] = useState({
    id: "",
    staff: "",
    processNumber: "",
    cuttingDate: getTodayDate(),
    itemName: "",
    itemType: "1",
    client: "",
    totalQuantity: 0,
    comment: "",
    products: [{ category: "", productId: "", quantity: 0 }],
  } as CuttingReportType);

  return (
    <Box w="100%" mt={12} px={6} rounded="md" boxShadow="md">
      <Container
        maxW="900px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <CuttingReportInputArea
          title="裁断報告書作成"
          pageType="new"
          report={report}
        />
      </Container>
    </Box>
  );
};

export default CuttingReportNew;
