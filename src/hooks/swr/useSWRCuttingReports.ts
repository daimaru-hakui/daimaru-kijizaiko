import useSWR from "swr";
export const useSWRCuttingReports = (
  startDay: string,
  endDay: string,
  staff: string,
  client: string
) => {
  const { data, mutate } = useSWR(
    `/api/cutting-reports/${startDay}/${endDay}?staff=${staff}&client=${client}`,
    { dedupingInterval: 10000, revalidateOnMount: true }
  );

  return { data, mutate };
};
