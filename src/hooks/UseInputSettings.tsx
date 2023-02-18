import { NextPage } from "next";
import { useState } from "react";
import { MaterialsType } from "../../types/MaterialsType";
import { ProductType } from "../../types/ProductType";
import { StockPlaceType } from "../../types/StockPlaceType";

type ObjectType = StockPlaceType | ProductType | MaterialsType



export const UseInputSettings = () => {
  const [items, setItems] = useState<any>({});

  const handleInputChange: any = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value } as ObjectType);
  };

  const handleNumberChange: any = (e: any, name: string) => {
    const value = e;
    setItems({ ...items, [name]: value } as ObjectType);
  };

  return { items, setItems, handleInputChange, handleNumberChange };
};
