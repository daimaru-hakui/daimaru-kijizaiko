import { useState } from "react";
import { StockPlaceType } from "../../types/StockPlaceType";
import { SupplierType } from "../../types/SupplierType";

type ObjectType = StockPlaceType | SupplierType

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
