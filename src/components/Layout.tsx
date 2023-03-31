import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Loading from "./Loading";
import Sidebar from "./Sidebar";
import { useDataList } from "../hooks/UseDataList";
import { useRecoilValue } from "recoil";
import { currentUserState } from "../../store";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const router = useRouter();
  const currentUser = useRecoilValue(currentUserState);

  useEffect(() => {
    if (currentUser === "") {
      router.push("/login");
    }
  }, [currentUser, router]);

  return (
    <Box
      fontWeight="400"
      letterSpacing="wide"
      bg="#f4f4f4"
      minH="100vh"
      w="100%"
    >
      <Loading />
      {currentUser === "" ? (
        <Flex>{children}</Flex>
      ) : (
        <>
          <Header />
          <Flex>
            <Sidebar />
            {children}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Layout;

{
  /* {router.pathname !== "/login" && <Header />}
<Flex>
  {router.pathname !== "/login" && <Sidebar />}
  {children}
</Flex> */
}
