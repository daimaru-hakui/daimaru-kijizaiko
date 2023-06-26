import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { useQueryCuttingReports } from "../hooks/useQueryCuttingReports";

export default function Home() {

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
