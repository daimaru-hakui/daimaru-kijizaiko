import { useState } from "react";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportInputArea from "../../../components/tokushima/CuttingReportInputArea";
import { useUtil } from "../../../hooks/UseUtil";

const CuttingReportNew = () => {
  const { getTodayDate } = useUtil()

  const [report, setReport] = useState({
    itemType: "",
    cuttingDate: getTodayDate(),
    processNumber: "",
    staff: "",
    itemName: "",
    client: "",
    totalQuantity: 0,
    comment: "",
    products: [{ category: "", productId: "", quantity: 0 }],
  } as CuttingReportType);

  return (
    <CuttingReportInputArea
      title="裁断報告書作成"
      pageType="new"
      report={report}
      onClose={() => { }}
    />
  );
};

export default CuttingReportNew;
