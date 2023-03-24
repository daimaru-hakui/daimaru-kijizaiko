import useSWRImmutable from "swr/immutable";
export const useSWRCuttingReportImutable = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate } = useSWRImmutable(
    `/api/cutting-reports/${startDay}/${endDay}`
  );
  return { data, mutate };
};
