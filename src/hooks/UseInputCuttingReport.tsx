import { useState } from 'react';
import { CuttingReportType } from "../../types/CuttingReportType";

export const useInputCuttingReport = () => {
  const [items, setItems] = useState({} as CuttingReportType);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
}