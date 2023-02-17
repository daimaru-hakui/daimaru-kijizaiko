import { useState } from "react";

export const useInputHandle = () => {
  const [items, setItems] = useState<any>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: any) => {
    const value = e;
    setItems({ ...items, rank: value });
  };

  return { items, setItems, handleInputChange, handleNumberChange };
};
