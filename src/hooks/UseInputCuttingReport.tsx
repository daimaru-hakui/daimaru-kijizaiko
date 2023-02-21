import { useState } from "react";
import { CuttingReportType } from "../../types/CuttingReportType";
import { useUtil } from "./UseUtil";

export const useInputCuttingReport = () => {
  const { getTodayDate } = useUtil();
  const [items, setItems] = useState({
    id: "",
    staff: "",
    processNumber: "",
    cuttingDate: getTodayDate(),
    itemName: "",
    itemType: "",
    client: "",
    totalQuantity: 0,
    comment: "",
    products: [{ category: "", productId: "", quantity: 0 }],
  } as CuttingReportType);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: any, name: string) => {
    const value = e;
    setItems({ ...items, [name]: value });
  };

  const handleRadioChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  return {
    items,
    setItems,
    handleInputChange,
    handleNumberChange,
    handleRadioChange,
  };
};
