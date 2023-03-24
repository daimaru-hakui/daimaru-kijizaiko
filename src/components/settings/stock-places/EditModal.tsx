import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { FaEdit } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { currentUserState } from "../../../../store";
import { StockPlaceType } from "../../../../types";
import { useForm, SubmitHandler } from "react-hook-form";

type Props = {
  stockPlace: StockPlaceType;
};

type Inputs = StockPlaceType;

const EditModal: NextPage<Props> = ({ stockPlace }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useRecoilValue(currentUserState);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      ...stockPlace,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const result = window.confirm("変更して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "stockPlaces", `${stockPlace.id}`);
    try {
      await updateDoc(docRef, {
        name: data.name || "",
        kana: data.kana || "",
        address: data.address || "",
        tel: data.tel || "",
        fax: data.fax || "",
        comment: data.comment || "",
        updateUser: currentUser || "",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  const onReset = () => {
    reset();
    onClose();
  };

  return (
    <>
      <FaEdit color="#444" cursor="pointer" onClick={onOpen} />
      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>編集</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={3}>
                <Text>仕入先名</Text>
                <Input {...register("name", { required: true })} />
                <Text>フリガナ</Text>
                <Input {...register("kana", { required: true })} />
                <Text>住所</Text>
                <Input {...register("address")} />
                <Flex gap={3}>
                  <Box>
                    <Text>TEL</Text>
                    <Input {...register("tel")} />
                  </Box>
                  <Box>
                    <Text>FAX</Text>
                    <Input {...register("fax")} />
                  </Box>
                </Flex>
                <Text>備考</Text>
                <Textarea {...register("comment")} />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} variant="ghost" onClick={onReset}>
                Close
              </Button>
              <Button type="submit" colorScheme="facebook">
                OK
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditModal;
