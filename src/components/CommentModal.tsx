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
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect, FC } from "react";
import { FaRegCommentDots } from "react-icons/fa";

type Props = {
  id: string;
  comment: string;
  collectionName: string;
  mutate?: Function;
};

export const CommentModal: FC<Props> = ({ comment }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newComment, setNewComment] = useState(comment);

  useEffect(() => {
    setNewComment(comment);
  }, [comment]);

  return (
    <>
      {comment && (
        <FaRegCommentDots
          opacity={comment === "" ? "0.2" : "1"}
          cursor="pointer"
          fontSize="20px"
          onClick={onOpen}
        />
      )}

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
            <Box>{newComment}</Box>
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
