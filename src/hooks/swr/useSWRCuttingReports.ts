import useSWR from "swr";
export const useSWRCuttingReports = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate,isLoading } = useSWR(
    `/api/cutting-reports/${startDay}/${endDay}`,
    { dedupingInterval: 15000}
  );

  return { data, mutate ,isLoading};
};
