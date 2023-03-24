import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import Header from "./Header";
import Loading from "./Loading";
import Sidebar from "./Sidebar";
import { useDataList } from "../hooks/UseDataList";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const router = useRouter();
  const { start } = useDataList();
  return (
    <Box
      fontWeight="400"
      letterSpacing="wide"
      bg="#f4f4f4"
      minH="100vh"
      w="100%"
    >
      <Loading />
      {router.pathname !== "/login" && <Header />}
      <Flex>
        {router.pathname !== "/login" && <Sidebar />}
        {children}
      </Flex>
    </Box>
  );
};

export default Layout;
