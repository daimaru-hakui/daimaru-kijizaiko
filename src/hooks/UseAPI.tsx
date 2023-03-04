import axios from "axios";
import useSWR, { useSWRConfig } from "swr";

export const useAPI = (url: string,) => {
  const fetcher = (url: string) =>
    axios.get(url).then((res) => res.data);
  const { data, isLoading } = useSWR(url, fetcher);
  const { mutate } = useSWRConfig();

  return { data, mutate, isLoading };
};
