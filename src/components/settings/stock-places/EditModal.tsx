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
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { currentUserState } from "../../../../store";
import { StockPlaceType } from "../../../../types/StockPlaceType";
import { UseInputSetting } from "../../../hooks/UseInputSetting";

type Props = {
  stockPlace: StockPlaceType;
};

const EditModal: NextPage<Props> = ({ stockPlace }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useRecoilValue(currentUserState);
  const { items, setItems, handleInputChange } = UseInputSetting()


  useEffect(() => {
    setItems(stockPlace);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockPlace]);

  const updateStockPlace = async () => {
    const result = window.confirm("変更して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "stockPlaces", `${stockPlace.id}`);
    try {
      await updateDoc(docRef, {
        name: items.name || "",
        kana: items.kana || "",
        address: items.address || "",
        tel: items.tel || "",
        fax: items.fax || "",
        comment: items.comment || "",
        updateUser: currentUser || "",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  const reset = () => {
    setItems({ ...stockPlace });
    onClose();
  };

  return (
    <>
      <FaEdit cursor="pointer" size="20px" onClick={onOpen} />
      <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Text>仕入先名</Text>
              <Input
                name="name"
                value={items?.name}
                onChange={handleInputChange}
              />
              <Text>フリガナ</Text>
              <Input
                name="kana"
                value={items?.kana}
                onChange={handleInputChange}
              />
              <Text>住所</Text>
              <Input
                name="address"
                value={items?.address}
                onChange={handleInputChange}
              />
              <Flex gap={3}>
                <Box>
                  <Text>TEL</Text>
                  <Input
                    name="tel"
                    value={items?.tel}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box>
                  <Text>FAX</Text>
                  <Input
                    name="fax"
                    value={items?.fax}
                    onChange={handleInputChange}
                  />
                </Box>
              </Flex>
              <Text>備考</Text>
              <Textarea
                name="comment"
                value={items?.comment}
                onChange={handleInputChange}
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={reset}>
              Close
            </Button>
            <Button colorScheme="facebook" onClick={updateStockPlace}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditModal;
