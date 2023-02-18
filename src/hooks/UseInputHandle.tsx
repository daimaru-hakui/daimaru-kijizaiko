import { NextPage } from "next";
import { useState } from "react";
import { MaterialsType } from "../../types/MaterialsType";
import { ProductType } from "../../types/ProductType";
import { StockPlaceType } from "../../types/StockPlaceType";

type ObjectType = StockPlaceType | ProductType | MaterialsType


export const useInputHandle = () => {
  const [items, setItems] = useState<any>({} as ObjectType);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value } as ObjectType);
  };

  const handleNumberChange = (e: any, name: string) => {
    const value = e;
    setItems({ ...items, [name]: value });
  };

  return { items, setItems, handleInputChange, handleNumberChange };
};
