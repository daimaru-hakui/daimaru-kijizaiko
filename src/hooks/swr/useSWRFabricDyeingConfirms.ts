import useSWR from "swr";
export const useSWRFabricDyeingConfirms = (
  startDay: string,
  endDay: string,
  staff: string
) => {
  const { data, mutate } = useSWR(
    `/api/fabric-dyeing-confirms/${startDay}/${endDay}?createUser=${staff}`,
    { dedupingInterval: 10000, revalidateOnMount: true }
  );
  return { data, mutate };
};
