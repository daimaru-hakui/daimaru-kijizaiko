import { Box, Button, Container, Flex } from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { db } from "../../../../firebase";
import { SupplierType } from "../../../../types";
import { SupplierInputArea } from "../../../components/settings/suppliers/SupplierInputArea";
import { NextPage } from "next";

const SupplierNew: NextPage = () => {
  const router = useRouter();

  const [supplier, setSupplier] = useState({
    id: "",
    name: "",
    kana: "",
    address: "",
    tel: "",
    fax: "",
    comment: "",
  } as SupplierType);

  const addSupplier = async (data: SupplierType) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const collectionSupplier = collection(db, "suppliers");
    try {
      await addDoc(collectionSupplier, {
        name: data.name || "",
        kana: data.kana || "",
        comment: data.comment || "",
        createdAt: serverTimestamp(),
      });
      router.push("/settings/suppliers");
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
          <Link href="/settings/suppliers/">
            <Button size="sm" variant="outline">
              戻る
            </Button>
          </Link>
        </Flex>
        <SupplierInputArea
          type="new"
          supplier={supplier}
          addSupplier={addSupplier}
        />
      </Container>
    </Box>
  );
};

export default SupplierNew;
