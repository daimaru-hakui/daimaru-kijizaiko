import useSWRImmutable from "swr/immutable";
export const useSWRCuttingReportImutable = (
  startDay: string,
  endDay: string,
  staff: string,
  client: string
) => {
  const { data, mutate } = useSWRImmutable(
    `/api/cutting-reports/${startDay}/${endDay}?staff=${staff}&client=${client}`
  );

  return { data, mutate };
};
