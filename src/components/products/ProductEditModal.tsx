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
import { FC } from "react";
import { useAuthStore } from "../../../store";
import { Product } from "../../../types";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { ProductInputArea } from "./ProductInputArea";

type Props = {
  product: Product;
  type: string | null;
};

export const ProductEditModal: FC<Props> = ({ product, type }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuths } = useAuthManagement();
  const currentUser = useAuthStore((state) => state.currentUser);

  return (
    <>
      {(isAuths(["rd", "tokushima"]) || currentUser === product.createUser) &&
        (type === "button" ? (
          <Button
            size="xs"
            variant="outline"
            colorScheme="facebook"
            onClick={onOpen}
          >
            編集
          </Button>
        ) : (
          <Box w="full" onClick={onOpen}>
            編集
          </Box>
        ))}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ProductInputArea
              title="生地の編集"
              pageType="edit"
              product={product}
              onClose={onClose}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
