import React, { useState } from "react";
import { Box, Container } from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../../firebase";
import { currentUserState, loadingState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";
import GrayFabricInputArea from "../../components/grayFabrics/GrayFabricInputArea";

const GrayFabricsNew = () => {
  const currentUser = useRecoilValue(currentUserState);
  const setLoading = useSetRecoilState(loadingState);
  const router = useRouter();
  const [items, setItems] = useState({} as GrayFabricType);

  const addGrayFabric = async () => {
    const result = window.confirm("登録して宜しいでしょうか。");
    if (!result) return;
    const grayFabricsCollectionRef = collection(db, "grayFabrics");
    try {
      setLoading(true);
      await addDoc(grayFabricsCollectionRef, {
        productName: items.productName || "",
        productNumber: items.productNumber || "",
        supplier: items.supplier || "",
        price: Number(items.price) || 0,
        comment: items.comment || "",
        wip: 0,
        stock: 0,
        createUser: currentUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      router.push("/gray-fabrics");
    }
  };

  return (
    <Box w="100%" mt={12}>
      <Container maxW="800px" my={6} p={6} bg="white" rounded="md">
        <Box as="h1" fontSize="2xl">
          キバタ登録
        </Box>
        <GrayFabricInputArea
          grayFabric={items}
          items={items}
          setItems={setItems}
          onClick={addGrayFabric}
          btnTitle="登録"
        />
      </Container>
    </Box>
  );
};

export default GrayFabricsNew;
