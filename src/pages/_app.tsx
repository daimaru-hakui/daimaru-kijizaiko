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
import { useRouter } from "next/router";
import { useAuthStore } from "../../store";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useDataList } from "../hooks/UseDataList";
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

const fetcher = (url: string) =>
  axios
    .get(url, { params: { API_KEY: process.env.NEXT_PUBLIC_API_KEY } })
    .then((res) => {
      return res.data;
    });

export default function App({ Component, pageProps }: AppProps) {
  const {
    getUsers,
    registerUser,
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
  } = useDataList();
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const queryClient = new QueryClient();

  useEffect(() => {
    getUsers();
    registerUser();
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
    console.log("getproduct");
  }, []);

  useEffect(() => {
    console.log("session");
    const getSession = async () => {
      if (auth.currentUser) {
        setSession(auth.currentUser);
        setCurrentUser(auth.currentUser?.uid);
      }
      onAuthStateChanged(auth, (session) => {
        if (session) {
          setSession(session);
          setCurrentUser(session?.uid);
          if (router.pathname === "/login") {
            router.push("/dashboard");
          }
        } else {
          setSession(null);
          setCurrentUser(undefined);
          router.push("/login");
        }
      });
    };
    getSession();
  }, [session]);

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
