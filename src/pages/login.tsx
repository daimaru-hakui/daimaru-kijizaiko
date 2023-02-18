import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Button, Container, Flex, Input } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { auth } from "../../firebase/index";
import { currentUserState, loadingState } from "../../store";
import { useAuthState } from "react-firebase-hooks/auth";

const Login = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const setLoading = useSetRecoilState(loadingState);
  const [account, setAccount] = useState({
    email: "",
    password: "",
  });
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  useLayoutEffect(() => {
    if (user) {
      setCurrentUser(user.uid);
      router.push("/");
    }
  }, [user, router, setCurrentUser]);

  // サインイン
  const signInUser = () => {
    setLoading(true);
    signInWithEmailAndPassword(auth, account.email, account.password)
      .then((userCredential) => {
        const user = userCredential.user;
        setCurrentUser(user?.uid);
        router.push("/");
      })
      .catch((error) => {
        console.log(error.message);
        window.alert("失敗しました");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setAccount({ ...account, [name]: value });
  };

  return (
    <Flex
      w="100%"
      h="100vh"
      alignItems="center"
      justifyContent="center"
      px={6}
      position="relative"
    >
      <Container
        maxW="400px"
        p={6}
        pb={10}
        borderRadius={6}
        boxShadow="base"
        bgColor="white"
      >
        <Flex
          w="100%"
          h="70px"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          fontSize="2xl"
        >
          <Box>
            <FaLock />
          </Box>
          <Box mt={1}>Sign in</Box>
        </Flex>
        <Flex
          flexDirection="column"
          justifyContent="space-around"
          mt={3}
          px={6}
        >
          <Input
            type="text"
            w="100%"
            mt={0}
            backgroundColor="rgb(232 240 254)"
            placeholder="メールアドレス"
            name="email"
            value={account.email}
            onChange={handleChange}
          />
          <Input
            type="password"
            w="100%"
            mt={3}
            backgroundColor="rgb(232 240 254)"
            placeholder="パスワード"
            name="password"
            value={account.password}
            onChange={handleChange}
          />

          <Button
            mt={3}
            color="white"
            bgColor="facebook.900"
            _hover={{ backgroundColor: "facebook.500" }}
            disabled={!account.email || !account.password}
            onClick={signInUser}
          >
            サインイン
          </Button>
        </Flex>
      </Container>
    </Flex>
  );
};

export default Login;
