import { useState } from "react";
import { ProductType } from "../../types/FabricType";

export const useInputProduct = () => {
  const [items, setItems] = useState({} as ProductType);

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

  const handleCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (e.target.checked) {
      setItems({
        ...items,
        [name]: [...(items["features"] || []), value],
      });
    } else {
      setItems({
        ...items,
        [name]: [
          ...items["features"]?.filter((feature: string) => feature !== value),
        ],
      });
    }
  };

  return { items, setItems, handleInputChange, handleNumberChange, handleRadioChange, handleCheckedChange };
};
