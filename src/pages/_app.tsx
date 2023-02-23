import "../../styles/globals.css";

import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import Layout from "../components/Layout";
import { RecoilRoot } from "recoil";
import theme from "../components/theme";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head><title>大丸白衣 生地在庫アプリ</title></Head>
      <ChakraProvider theme={theme}>
        <RecoilRoot>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RecoilRoot>
      </ChakraProvider>
    </>
  );
}
