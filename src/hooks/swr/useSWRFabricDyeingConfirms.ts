import useSWR from "swr";
export const useSWRFabricDyeingConfirms = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate } = useSWR(
    `/api/fabric-dyeing-confirms/${startDay}/${endDay}`,
    { dedupingInterval: 10000, revalidateOnMount: true }
  );
  return { data, mutate };
};
