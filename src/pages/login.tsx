import { Box, Button, Container, Flex, Input, Stack } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { useLoadingStore } from "../../store";
import { NextPage } from "next";
import { auth } from "../../firebase/index";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useForm } from "react-hook-form";

const Login: NextPage = () => {
  const setIsLoading = useLoadingStore((state) => state.setIsLoading);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: { email: string; password: string }) => {
    signInUser(data.email, data.password);
  };
  const signInUser = (email: string, password: string) => {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
      })
      .catch((error) => {
        console.log(error.message);
        window.alert("失敗しました");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Flex w="100%" h="100vh" align="center" justify="center">
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
              direction="column"
              justify="center"
              align="center"
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
  );
};

export default Login;
