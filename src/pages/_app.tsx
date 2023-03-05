import "../../styles/globals.css";

import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import Layout from "../components/Layout";
import { RecoilRoot } from "recoil";
import theme from "../components/theme";
import Head from "next/head";
import { SWRConfig } from "swr";
import axios from "axios";

const fetcher = (url: string) =>
  axios.get(url).then((res) => res.data);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head><title>大丸白衣 生地在庫アプリ</title></Head>
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
