import useSWR from "swr";
import { History } from "../../../types";

type Data = {
  contents:History[]
}
export const useSWRPurchaseConfirms = (
  startDay: string,
  endDay: string,
  
) => {
  const { data, mutate,isLoading } = useSWR<Data>(
    `/api/fabric-purchase-confirms/${startDay}/${endDay}`
  );
  return { data, mutate ,isLoading};
};
