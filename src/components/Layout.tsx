import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Loading from "./Loading";
import Sidebar from "./Sidebar";
import { auth } from "../../firebase";
import { useRecoilState } from "recoil";
import { currentUserState } from "../../store";
import { onAuthStateChanged } from "firebase/auth";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user?.uid);
      } else {
        setCurrentUser("");
        router.push("/login");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
