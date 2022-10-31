import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";
import Header from "./Header";
import Loading from "./Loading";
import Sidebar from "./Sidebar";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const router = useRouter();
  return (
    <Box bg="#f4f4f4" minH="100vh">
      <Loading />
      {router.pathname !== "/login" && <Header />}
      <Flex>
        {router.pathname !== "/login" && <Sidebar />}
        <Box w="100%" px={6} mt={12}>
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
