import useSWR from "swr";
export const useSWRFabricDyeingConfirms = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate,isLoading } = useSWR(
    `/api/fabric-dyeing-confirms/${startDay}/${endDay}`,
    { dedupingInterval: 10000 }
  );
  return { data, mutate,isLoading };
};
