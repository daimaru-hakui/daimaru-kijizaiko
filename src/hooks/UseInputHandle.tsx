import { useState } from "react";
import { ProductType } from "../../types/FabricType";
import { HistoryType } from "../../types/HistoryType";

type ObjectType = HistoryType | ProductType
export const useInputHandle = () => {
  const [items, setItems] = useState({} as ObjectType);

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

  return { items, setItems, handleInputChange, handleNumberChange };
};
