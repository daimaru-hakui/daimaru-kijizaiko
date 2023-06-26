import useSWR from "swr";
import { History } from "../../../types";

type Data = {
  contents:History[]
}

export const useSWRFabricDyeingConfirms = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate,isLoading } = useSWR<Data>(
    `/api/fabric-dyeing-confirms/${startDay}/${endDay}`,
    { dedupingInterval: 10000 }
  );
  return { data, mutate,isLoading };
};
