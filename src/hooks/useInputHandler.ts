import { useState } from "react";
import { History } from "../../types";

export const useInputHandler = () => {
  const [items, setItems] = useState({} as History);

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
    setItems({ ...items, [name]: value });
  };

  const onReset = (obj: History) => {
    setItems({ ...obj });
  };

  return {
    items,
    setItems,
    handleInputChange,
    handleNumberChange,
    handleRadioChange,
    onReset,
  };
};
