import { useState } from "react";
import { ProductType } from "../../types/FabricType";
import { MaterialsType } from "../../types/MaterialsType";
import { StockPlaceType } from "../../types/StockPlaceType";

type ObjectType = StockPlaceType | MaterialsType | ProductType

export const useInputHandle = () => {
  const [items, setItems] = useState({} as ObjectType);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value } as ObjectType);
  };

  const handleNumberChange = (e: any, name: string) => {
    const value = e;
    setItems({ ...items, [name]: value } as ObjectType);
  };

  return { items, setItems, handleInputChange, handleNumberChange };
};
