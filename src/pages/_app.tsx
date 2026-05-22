/* eslint-disable react-hooks/exhaustive-deps */
import "../../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import theme from "../components/theme";
import Head from "next/head";
import { SWRConfig } from "swr";
import axios from "axios";
import { useEffect } from "react";
import { useDataList } from "../hooks/UseDataList";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const fetcher = (url: string) =>
  axios
    .get(url)
    .then((res) => res.data);

export default function App({ Component, pageProps }: AppProps) {
  const {
    getUsers,
    getProducts,
    getFabricPurchaseOrders,
    getGrayfabrics,
    getGrayFabricOrders,
    getFabricDyeingOrders,
    getSuppliers,
    getStockPlaces,
    getLocations,
    getColors,
    getMaterialNames,
    getCuttingSchedules,
  } = useDataList();
  const queryClient = new QueryClient();

  useEffect(() => {
    // TODO(phase4): Server Components への移行後、この初期ロードは廃止する
    getUsers();
    getProducts();
    getFabricPurchaseOrders();
    getGrayfabrics();
    getGrayFabricOrders();
    getFabricDyeingOrders();
    getSuppliers();
    getStockPlaces();
    getLocations();
    getColors();
    getMaterialNames();
    getCuttingSchedules();
  }, []);

  return (
    <>
      <Head>
        <title>大丸白衣 生地在庫アプリ</title>
      </Head>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <SWRConfig value={{ fetcher }}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </SWRConfig>
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}
