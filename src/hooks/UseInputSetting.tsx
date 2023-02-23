import { useState } from "react";
import { ColorType } from "../../types/ColorType";
import { StockPlaceType } from "../../types/StockPlaceType";
import { SupplierType } from "../../types/SupplierType";

export const UseInputSetting = () => {
  const [items, setItems] = useState({} as StockPlaceType | SupplierType);

  const handleInputChange: any = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange: any = (e: any, name: string) => {
    const value = e;
    setItems({ ...items, [name]: value });
  };

  return { items, setItems, handleInputChange, handleNumberChange };
};
