import useSWR from "swr";
export const useSWRPurchaseConfirms = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate } = useSWR(
    `/api/fabric-purchase-confirms/${startDay}/${endDay}`,
    { dedupingInterval: 10000, revalidateOnMount: true }
  );
  return { data, mutate };
};
