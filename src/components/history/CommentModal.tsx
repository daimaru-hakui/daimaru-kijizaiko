import {
  Button,
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

type Props = {
  id: string;
  comment: string;
  collectionName: string;
};

const CommentModal: NextPage<Props> = ({ id, comment, collectionName }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setNewComment(comment);
  }, [comment]);

  const updateComment = async (collectionName: string, docId: string) => {
    const commentRef = doc(db, collectionName, docId);
    try {
      await updateDoc(commentRef, {
        comment: newComment,
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  return (
    <>
      <FaRegCommentDots
        opacity={comment === "" ? "0.2" : "1"}
        cursor="pointer"
        fontSize="20px"
        onClick={onOpen}
      />

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setNewComment(comment);
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
              value={newComment}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => setNewComment(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                setNewComment(comment);
                onClose();
              }}
            >
              閉じる
            </Button>
            <Button
              colorScheme="blue"
              disabled={newComment === comment}
              onClick={() => updateComment(collectionName, id)}
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
