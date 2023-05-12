import Head from "next/head";
import { useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <Box w="100%" mt={12}>
      <Head>
        <title>生地在庫</title>
        <meta name="description" content="大丸白衣 生地在庫アプリ" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </Box>
  );
}
