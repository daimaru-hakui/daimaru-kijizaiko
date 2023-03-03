import axios from "axios";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useUtil } from "./UseUtil";

export const useAPI = (url: string, limit: number) => {
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate } = useUtil();
  const [startDay, setStartDay] = useState(INIT_DATE);
  const [endDay, setEndDay] = useState(getTodayDate());
  const [limitNum, setLimitNum] = useState(limit);

  const fetcher = (url: string) =>
    axios
      .get(url, {
        params: {
          startDay,
          endDay,
          limitNum
        },
      })
      .then((res) => res.data);
  const { data, isLoading } = useSWR(url, fetcher);
  const { mutate } = useSWRConfig();

  const onReset = () => {
    setStartDay(INIT_DATE);
    setEndDay(getTodayDate());
    setLimitNum(limit);
  };

  return { data, mutate, startDay, setStartDay, endDay, setEndDay, onReset, limitNum, setLimitNum, isLoading };
};
