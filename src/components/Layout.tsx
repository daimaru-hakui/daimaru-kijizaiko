import { Box } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import Header from "./Header";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <Box bg="#f4f4f4" minH="100vh">
      <Header />
      <Box p={6}>{children}</Box>
    </Box>
  );
};

export default Layout;
