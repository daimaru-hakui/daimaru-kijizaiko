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
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../../firebase";
import { currentUserState, loadingState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";
import GrayFabricInputArea from "./GrayFabricInputArea";

type Props = {
  grayFabric: GrayFabricType;
};

const GrayFabricEditModal: NextPage<Props> = ({ grayFabric }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState<any>({});
  const currentUser = useRecoilValue(currentUserState);
  const setLoading = useSetRecoilState(loadingState);
  const router = useRouter();

  useEffect(() => {
    setItems({ ...grayFabric });
  }, [grayFabric]);

  const reset = () => {
    setItems(grayFabric);
  };

  const updateGrayFabric = async () => {
    const result = window.confirm("更新して宜しいでしょうか。");
    if (!result) return;
    const grayFabricsDocnRef = doc(db, "grayFabrics", grayFabric.id);
    try {
      setLoading(true);
      await updateDoc(grayFabricsDocnRef, {
        productName: items.productName || "",
        productNumber: items.productNumber || "",
        supplier: items.supplier || "",
        price: Number(items.price) || 0,
        comment: items.comment || "",
        wip: 0,
        stock: 0,
        updateUser: currentUser,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      reset();
      onClose();
      router.push("/gray-fabrics");
    }
  };

  return (
    <>
      <FaEdit cursor="pointer" size="20px" onClick={onOpen} />
      <Modal
        isOpen={isOpen}
        onClose={() => {
          reset();
          onClose();
        }}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>キバタ詳細</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <GrayFabricInputArea
              grayFabric={grayFabric}
              items={items}
              setItems={setItems}
              onClick={updateGrayFabric}
              btnTitle="更新"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                reset();
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

export default GrayFabricEditModal;
