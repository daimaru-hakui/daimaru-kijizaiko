import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  useDisclosure,
  Input,
} from "@chakra-ui/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { db } from "../../../../firebase";

type Props = {
  uid: string;
};

const AuthEditModal: NextPage<Props> = ({ uid }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<any>();

  // usersデータ 取得
  useEffect(() => {
    const docRef = doc(db, "users", `${uid}`);
    const getUser = async () => {
      const docSnap = await getDoc(docRef);
      setUser({ ...docSnap.data() });
    };
    getUser();
  }, [uid]);

  // リセット
  const reset = () => {
    const docRef = doc(db, "users", `${uid}`);
    const getUsers = async () => {
      const docSnap = await getDoc(docRef);
      setUser({ ...docSnap.data() });
    };
    getUsers();
  };

  const updateName = async () => {
    const docRef = doc(db, "users", `${uid}`);
    await updateDoc(docRef, {
      rank: Number(user.rank),
      name: user.name,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setUser({ ...user, [name]: value });
  };

  const handleIncrementChange = (e: any) => {
    const value = e;
    setUser({ ...user, rank: value });
  };

  return (
    <>
      <Button onClick={onOpen} size="sm">
        編集
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>名前編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Box>
                <Text>id</Text>
                <NumberInput
                  name="rank"
                  onChange={handleIncrementChange}
                  value={user?.rank}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Box>
                <Text>名前</Text>
                <Input
                  name="name"
                  value={user?.name}
                  onChange={handleInputChange}
                />
              </Box>
              <Box>
                <Box><Box as="span" mr={2}>email:</Box>{user?.email}</Box>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              mr={2}
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              キャンセル
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                updateName();
                onClose();
              }}
              mr={3}
            >
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthEditModal;
