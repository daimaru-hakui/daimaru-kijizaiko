import { Box, Button, Container, Flex } from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { currentUserState } from "../../../../store";
import { StockPlaceType } from "../../../../types";
import { StockPlaceInputArea } from "../../../components/settings/stock-places/StockPlaceInputArea";
import { NextPage } from "next";

const StockPlaceNew: NextPage = () => {
  const router = useRouter();
  const currentUser = useRecoilValue(currentUserState);
  const [stockPlace, setStockPlace] = useState({
    id: "",
    name: "",
    kana: "",
    address: "",
    tel: "",
    fax: "",
    comment: "",
  });

  const addStockPlace = async (data: StockPlaceType) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const collectionStockPlaces = collection(db, "stockPlaces");
    try {
      await addDoc(collectionStockPlaces, {
        name: data.name || "",
        kana: data.kana || "",
        address: data.address || "",
        tel: data.tel || "",
        fax: data.fax || "",
        comment: data.comment || "",
        createUser: currentUser || "",
        updateUser: currentUser || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push("/settings/stock-places");
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  return (
    <Box w="100%" mt={12} px={6}>
      <Container
        maxW="500px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Flex justifyContent="space-between">
          <Box as="h2" fontSize="2xl">
            仕入先登録
          </Box>
          <Link href="/settings/stock-places/">
            <Button size="sm" variant="outline">
              戻る
            </Button>
          </Link>
        </Flex>
        <StockPlaceInputArea
          type="new"
          stockPlace={stockPlace}
          addStockPlace={addStockPlace}
        />
      </Container>
    </Box>
  );
};

export default StockPlaceNew;
