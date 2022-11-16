import {
  Box,
  Button,
  Container,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { MdOutlineSettings } from "react-icons/md";
import { useRouter } from "next/router";
import React, { useLayoutEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue } from "recoil";
import { auth } from "../../firebase";
import { currentUserAuth, usersAuthState } from "../../store";
import MenuDrawerButton from "./MenuDrawerButton";
import Link from "next/link";

const Header = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useRecoilState(currentUserAuth);
  const users = useRecoilValue(usersAuthState);

  useLayoutEffect(() => {
    if (currentUser === "") {
      router.push("/login");
    }
  }, [currentUser, router]);

  // 担当者名の表示
  const dispStaff = (id: string) => {
    const user = users?.find(
      (user: { id: string; name: string }) => id === user.id
    );
    return user?.name;
  };
  console.log(users);

  // サインアウト
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
          <Link href="/">生地在庫WEB</Link>
          <Flex alignItems="center" gap={3}>
            <Box>
              <Text fontSize="sm">{dispStaff(currentUser)}</Text>
            </Box>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<MdOutlineSettings size="25px" />}
                variant="outline"
              />
              <MenuList fontSize="sm">
                <MenuItem>トップページ</MenuItem>
                <MenuItem>設定</MenuItem>
                <MenuItem onClick={signOut}>ログアウト</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Container>
    </Flex>
  );
};

export default Header;
