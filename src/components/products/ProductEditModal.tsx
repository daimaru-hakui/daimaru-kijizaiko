import {
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
import { NextPage } from "next";
import { useRecoilValue } from "recoil";
import { currentUserState } from "../../../store";
import { ProductType } from "../../../types/FabricType";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import ProductInputArea from "./ProductInputArea";

type Props = {
  product: ProductType;
};

const ProductEditModal: NextPage<Props> = ({ product }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuths } = useAuthManagement();
  const currentUser = useRecoilValue(currentUserState);

  return (
    <>
      {(isAuths(["rd"]) || currentUser === product.createUser) && (
        <Button
          size="xs"
          variant="outline"
          colorScheme="facebook"
          onClick={onOpen}
        >
          編集
        </Button>
      )}
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

export default ProductEditModal;
