import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { db } from "../../../firebase";
import { HistoryType } from "../../../types/HistoryType";

type Props = {
  history: HistoryType;
  collectionName: string;
};

const CommentModal: NextPage<Props> = ({ history, collectionName }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [comment, setComment] = useState("");
  const [reset, setReset] = useState("");

  useEffect(() => {
    setComment(history.comment);
    setReset(history.comment);
  }, [history]);

  const updateComment = async (collectionName: string, docId: string) => {
    const commentRef = doc(db, collectionName, docId);
    try {
      await updateDoc(commentRef, {
        comment: comment,
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  return (
    <>
      {/* <Flex justifyContent="center"> */}
      <FaRegCommentDots
        opacity={history.comment === "" ? "0.2" : "1"}
        cursor="pointer"
        fontSize="20px"
        onClick={onOpen}
      />
      {/* </Flex> */}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setComment(reset);
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>コメント</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              h="400px"
              value={comment}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => setComment(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                setComment(reset);
                onClose();
              }}
            >
              閉じる
            </Button>
            <Button
              colorScheme="blue"
              disabled={history.comment === comment}
              onClick={() => updateComment(collectionName, history.id)}
            >
              更新
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CommentModal;
