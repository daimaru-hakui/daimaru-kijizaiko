import useSWR from "swr";
import { GrayFabric, GrayFabricHistory } from "../../../types";

type Data = {
  contents:GrayFabricHistory[]
}
export const useSWRGrayFavricConfirms = (
  startDay: string,
  endDay: string,
) => {
  const { data, mutate,isLoading } = useSWR<Data>(`/api/gray-fabric-confirms/${startDay}/${endDay}`,
    { dedupingInterval: 10000 }
  );
  return { data, mutate,isLoading };
};
