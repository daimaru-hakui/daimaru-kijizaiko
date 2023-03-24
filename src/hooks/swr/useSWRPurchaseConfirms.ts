import useSWR from "swr";
export const useSWRPurchaseConfirms = (
  startDay: string,
  endDay: string,
  staff: string
) => {
  const { data, mutate } = useSWR(
    `/api/fabric-purchase-confirms/${startDay}/${endDay}?createUser=${staff}`,
    { dedupingInterval: 10000, revalidateOnMount: true }
  );
  return { data, mutate };
};
