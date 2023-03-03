import axios from "axios";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useUtil } from "./UseUtil";

export const useCuttingReportAPI = (url: string) => {
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate } = useUtil();
  const [startDay, setStartDay] = useState(INIT_DATE);
  const [endDay, setEndDay] = useState(getTodayDate());

  const fetcher = (url: string) =>
    axios
      .get(url, {
        params: {
          startDay,
          endDay,
        },
      })
      .then((res) => res.data);
  const { data } = useSWR(url, fetcher);
  const { mutate } = useSWRConfig();

  const onReset = () => {
    setStartDay(INIT_DATE);
    setEndDay(getTodayDate());
  };

  return { data, mutate, startDay, setStartDay, endDay, setEndDay, onReset };
};
