import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import EditModal from "../../../components/stock-places/EditModal";

const StockPlaceId = () => {
  const router = useRouter();
  const stockPlaceId = router.query.stockPlaceId;
  const [stockPlace, setStockPlace] = useState<any>();

  useEffect(() => {
    const getStockPlace = async () => {
      const docRef = doc(db, "stockPlaces", `${stockPlaceId}`);
      try {
        onSnapshot(docRef, (querySnap) => {
          setStockPlace({ ...querySnap.data(), id: querySnap.id });
        });
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getStockPlace();
  }, [router, stockPlaceId]);
  return (
    <Box w="100%" mt={12}>
      <Container maxW="800px" mt={6} p={0}>
        <Link href="/settings/stock-places">
          <Button w="100%">一覧へ</Button>
        </Link>
      </Container>
      <Container
        maxW="800px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Flex justifyContent="space-between">
          <Box as="h2" fontSize="2xl">
            送り先詳細
          </Box>
          <Box>
            <EditModal stockPlace={stockPlace} />
          </Box>
        </Flex>
        <Stack spacing={6} mt={6}>
          <Flex gap={6} flexDirection={{ base: "column" }}>
            <Box w="100%" flex={2}>
              <Text>送り先名</Text>
              <Box mt={2} ml={2}>
                {stockPlace?.name}
              </Box>
            </Box>
            <Box w="100%" flex={1}>
              <Text>フリガナ</Text>
              <Box mt={2} ml={2}>
                {stockPlace?.kana}
              </Box>
            </Box>
            <Box w="100%" flex={1}>
              <Text>備考</Text>
              <Box mt={2} ml={2}>
                {stockPlace?.comment}
              </Box>
            </Box>
          </Flex>

          {/* <Button colorScheme="facebook" onClick={addSupplier}>
            登録
          </Button> */}
        </Stack>
      </Container>
    </Box>
  );
};

export default StockPlaceId;
