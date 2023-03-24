import useSWR from "swr";
export const useSWRCuttingReports = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate } = useSWR(
    `/api/cutting-reports/${startDay}/${endDay}`,
    { dedupingInterval: 10000, revalidateOnMount: true }
  );

  return { data, mutate };
};
