import { Box } from "@chakra-ui/react";
import React from "react";
import MenuLists from "./MenuLists";

const Sidebar = () => {
  const returnNull = () => {
    return;
  };
  return (
    <Box
      as="nav"
      display={{ base: "none", "2xl": "block" }}
      p={6}
      pt={16}
      minW="250px"
      h="100vh"
      bg="white"
      boxShadow="md"
      position="sticky"
      top="0"
      zIndex={1}
      overflow="auto"
    >
      <MenuLists onClose={returnNull} />
    </Box>
  );
};

export default Sidebar;
