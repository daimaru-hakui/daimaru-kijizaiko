import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Button, Container, Flex, Input, Stack } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { useRecoilState, useSetRecoilState } from "recoil";
import { currentUserState, loadingState } from "../../store";
import { NextPage } from "next";
import { auth } from "../../firebase/index";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useForm } from "react-hook-form";

const Login: NextPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const setLoading = useSetRecoilState(loadingState);
  const [user] = useAuthState(auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: { email: string; password: string }) => {
    signInUser(data.email, data.password);
  };
  const signInUser = (email: string, password: string) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setCurrentUser(user?.uid);
      })
      .catch((error) => {
        console.log(error.message);
        window.alert("失敗しました");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user?.uid);
        router.push("/dashboard");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {currentUser === "" && (
        <Flex w="100%" h="100vh" alignItems="center" justifyContent="center">
          <Container
            maxW="350px"
            p={6}
            rounded="md"
            boxShadow="base"
            bgColor="white"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <Flex
                  w="100%"
                  h="70px"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  fontSize="2xl"
                >
                  <FaLock />
                  <Box>Sign in</Box>
                </Flex>
                <Box>
                  <Input
                    placeholder="メールアドレス"
                    {...register("email", { required: true })}
                  />
                  {errors.email && (
                    <Box as="span" color="red">
                      emailアドレスを入力してください
                    </Box>
                  )}
                </Box>
                <Box>
                  <Input
                    type="password"
                    placeholder="パスワード"
                    {...register("password", { required: true })}
                  />
                  {errors.password && (
                    <Box as="span" color="red">
                      password入力してください
                    </Box>
                  )}
                </Box>
                <Button
                  type="submit"
                  color="white"
                  bgColor="facebook.900"
                  _hover={{ backgroundColor: "facebook.500" }}
                >
                  サインイン
                </Button>
              </Stack>
            </form>
          </Container>
        </Flex>
      )}
    </>
  );
};

export default Login;
