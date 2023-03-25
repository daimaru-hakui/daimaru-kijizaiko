import useSWR from "swr";
export const useSWRPurchaseConfirms = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate,isLoading } = useSWR(
    `/api/fabric-purchase-confirms/${startDay}/${endDay}`,
    { dedupingInterval: 10000 }
  );
  return { data, mutate ,isLoading};
};
