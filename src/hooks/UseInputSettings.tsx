import { useState } from "react";
import { StockPlaceType } from "../../types/StockPlaceType";

export const UseInputSettings = () => {
  const [items, setItems] = useState({} as StockPlaceType);

  const handleInputChange: any = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange: any = (e: any, name: string) => {
    const value = e;
    setItems({ ...items, [name]: value });
  };

  return { items, setItems, handleInputChange, handleNumberChange };
};
