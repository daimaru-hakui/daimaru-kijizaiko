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
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import EditModal from "../../components/suppliers/EditModal";

const SupplierId = () => {
  const router = useRouter();
  const supplierId = router.query.supplierId;
  const [supplier, setSupplier] = useState<any>();

  useEffect(() => {
    const getSupplier = async () => {
      const docRef = doc(db, "suppliers", `${supplierId}`);
      try {
        onSnapshot(docRef, (querySnap) => {
          setSupplier({ ...querySnap.data(), id: querySnap.id });
        });
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getSupplier();
  }, [router, supplierId]);
  return (
    <Box w="100%" mt={12}>
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
            仕入先詳細
          </Box>
          <Box>
            <EditModal supplier={supplier} />
          </Box>
        </Flex>
        <Stack spacing={6} mt={6}>
          <Flex gap={6} flexDirection={{ base: "column" }}>
            <Box w="100%" flex={2}>
              <Text>仕入先名</Text>
              <Box mt={2} ml={2}>
                {supplier?.name}
              </Box>
            </Box>
            <Box w="100%" flex={1}>
              <Text>フリガナ</Text>
              <Box mt={2} ml={2}>
                {supplier?.kana}
              </Box>
            </Box>
            <Box w="100%" flex={1}>
              <Text>備考</Text>
              <Box mt={2} ml={2}>
                {supplier?.comment}
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

export default SupplierId;
