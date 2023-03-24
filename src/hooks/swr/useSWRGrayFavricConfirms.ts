import useSWR from "swr";
export const useSWRGrayFavricConfirms = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate } = useSWR(`/api/gray-fabric-confirms/${startDay}/${endDay}`,
    { dedupingInterval: 10000, revalidateOnMount: true }
  );
  return { data, mutate };
};
