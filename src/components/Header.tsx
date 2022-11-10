import { Box, Button, Container, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useLayoutEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue } from "recoil";
import { auth } from "../../firebase";
import { currentUserAuth } from "../../store";
import MenuDrawerButton from "./MenuDrawerButton";

const Header = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useRecoilState(currentUserAuth);

  useLayoutEffect(() => {
    if (currentUser === "") {
      router.push("/login");
    }
  }, [currentUser, router]);

  const signOut = () => {
    setCurrentUser("");
    auth
      .signOut()
      .then(() => {
        console.log("ログアウトしました");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Flex
      w="100%"
      h={12}
      alignItems="center"
      bg="white"
      boxShadow="sm"
      position="fixed"
      top={0}
      zIndex={10}
    >
      <Container maxW="100%">
        <Flex alignItems="center" justifyContent="space-between">
          <MenuDrawerButton />
          生地在庫
          <Box>
            <Button onClick={signOut}>logout</Button>
          </Box>
        </Flex>
      </Container>
    </Flex>
  );
};

export default Header;
