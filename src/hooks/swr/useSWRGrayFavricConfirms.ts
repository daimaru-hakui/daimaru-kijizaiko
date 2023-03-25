import useSWR from "swr";
export const useSWRGrayFavricConfirms = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate,isLoading } = useSWR(`/api/gray-fabric-confirms/${startDay}/${endDay}`,
    { dedupingInterval: 10000 }
  );
  return { data, mutate,isLoading };
};
