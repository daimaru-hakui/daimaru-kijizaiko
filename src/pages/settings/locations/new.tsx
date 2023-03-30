import { Box, Button, Container, Flex } from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { db } from "../../../../firebase";
import { LocationType } from "../../../../types";
import { useRecoilValue } from "recoil";
import { locationsState } from "../../../../store";
import { NextPage } from "next";
import { LocationInputArea } from "../../../components/settings/locations/LocationInputArea";

const LocationNew: NextPage = () => {
  const router = useRouter();
  const locations = useRecoilValue(locationsState);
  const [location, setLocation] = useState({
    id: "",
    name: "",
    order: locations.length + 1,
    comment: "",
  } as LocationType);

  const addLocation = async (data: LocationType) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const collectionRef = collection(db, "locations");
    try {
      await addDoc(collectionRef, {
        name: data.name || "",
        order: locations.length + 1,
        comment: data.comment || "",
        createdAt: serverTimestamp(),
      });
      router.push("/settings/locations");
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
            徳島保管場所登録
          </Box>
          <Link href="/settings/locations/">
            <Button size="sm" variant="outline">
              戻る
            </Button>
          </Link>
        </Flex>
        <LocationInputArea
          type="new"
          location={location}
          addLocation={addLocation}
        />
      </Container>
    </Box>
  );
};

export default LocationNew;
