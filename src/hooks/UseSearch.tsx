import React, { useState } from "react";
import { useUtil } from "./UseUtil";

const useSearch = () => {
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate } = useUtil();
  const [startDay, setStartDay] = useState(INIT_DATE);
  const [endDay, setEndDay] = useState(getTodayDate());
  const [items, setItems] = useState({ start: startDay, end: endDay });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const onSearch = () => {
    setStartDay(items.start);
    setEndDay(items.end);
  };
  return { startDay, endDay, handleInputChange, onSearch, items, setItems };
};

export default useSearch;
