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

const fetcher = (url: string) =>
  axios
    .get(url, { params: { API_KEY: process.env.NEXT_PUBLIC_API_KEY } })
    .then((res) => {
      return res.data;
    });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const currentUser = useAuthStore((state) => state.currentUser);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setUsers = useAuthStore((state) => state.setUsers);

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
          router.push("/");
        } else {
          setSession(null);
          setCurrentUser(undefined);
          router.push("/login");
        }
      });
    };
    getSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  return (
    <>
      <Head>
        <title>大丸白衣 生地在庫アプリ</title>
      </Head>
      <ChakraProvider theme={theme}>
        <SWRConfig value={{ fetcher }}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SWRConfig>
      </ChakraProvider>
    </>
  );
}
