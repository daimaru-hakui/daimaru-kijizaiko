import { useState } from "react";
import { Box, Container } from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../../firebase";
import { currentUserState, loadingState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";
import GrayFabricInputArea from "../../components/grayFabrics/GrayFabricInputArea";

const GrayFabricsNew = () => {

  return (
    <Box w="100%" mt={12}>
      <Container maxW="800px" my={6} p={6} bg="white" rounded="md">
        <Box as="h1" fontSize="2xl">
          キバタ登録
        </Box>
        <GrayFabricInputArea
          title="登録"
          grayFabric={{} as GrayFabricType}
          toggleSwitch="new"
          onClose={()=>{}}
        />
      </Container>
    </Box>
  );
};

export default GrayFabricsNew;
