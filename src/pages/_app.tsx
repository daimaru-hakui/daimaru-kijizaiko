import "../../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { RecoilRoot } from "recoil";
import { Layout } from "../components/Layout";
import theme from "../components/theme";
import Head from "next/head";
import { SWRConfig } from "swr";
import axios from "axios";

const fetcher = (url: string) =>
  axios
    .get(url, { params: { API_KEY: process.env.NEXT_PUBLIC_API_KEY } })
    .then((res) => {
      return res.data;
    });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>大丸白衣 生地在庫アプリ</title>
      </Head>
      <ChakraProvider theme={theme}>
        <RecoilRoot>
          <SWRConfig value={{ fetcher }}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </SWRConfig>
        </RecoilRoot>
      </ChakraProvider>
    </>
  );
}
