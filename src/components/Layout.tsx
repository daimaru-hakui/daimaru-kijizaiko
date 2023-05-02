import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode, FC } from "react";
import { Header } from "./Header";
import { Loading } from "./Loading";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../../store";

type Props = {
  children: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const router = useRouter();
  return (
    <Box
      fontWeight="400"
      letterSpacing="wide"
      bg="#f4f4f4"
      minH="100vh"
      w="full"
    >
      <Loading />
      {router.pathname === "/login" ? (
        <Flex>{children}</Flex>
      ) : (
        currentUser && (
          <>
            <Header />
            <Flex>
              <Sidebar />
              {children}
            </Flex>
          </>
        )
      )}
    </Box>
  );
};
