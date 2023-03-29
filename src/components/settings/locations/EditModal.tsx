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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
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
import { LocationType } from "../../../../types";
import { useForm, SubmitHandler } from "react-hook-form";

type Props = {
  location: LocationType;
};

type Inputs = LocationType;

const EditLocationModal: NextPage<Props> = ({ location }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useRecoilValue(currentUserState);
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      ...location,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const result = window.confirm("変更して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "locations", `${location.id}`);
    try {
      await updateDoc(docRef, {
        name: data.name || "",
        order: Number(data.order) || 1000,
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
                <Text>場所名</Text>
                <Input {...register("name", { required: true })} />
                <Text>順番</Text>
                <NumberInput
                  {...register("order")}
                  onChange={() => getValues}
                  min={0}
                  max={1000}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
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

export default EditLocationModal;
