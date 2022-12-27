import {
  Box,
  Button,
  Container,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import EditModal from "../../../components/settings/auth/AuthEditModal";

const Auth = () => {
  const [users, setUsers] = useState<any>();

  //firestore users 情報の取得
  useEffect(() => {
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, orderBy("rank", "asc"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      setUsers(
        querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    });
    return unsub;
  }, []);

  // R&Dに追加
  const isAuthToggle = async (user: any, prop: string) => {
    try {
      const docRef = doc(db, "users", user.uid);
      let toggle;
      if (user[prop] && user[prop] === true) {
        toggle = false;
      } else {
        toggle = true;
      }
      await updateDoc(docRef, {
        [prop]: toggle,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Box w="100%" mt={12}>
      <Container maxW="900px" my={6} rounded="md" bg="white" boxShadow="md">
        <TableContainer p={6} maxW="100%">
          <Box as="h2" fontSize="2xl">
            権限管理
          </Box>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>名前</Th>
                <Th>R&D</Th>
                <Th>入力権限</Th>
                <Th>編集</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users?.map(
                (user: {
                  uid: string;
                  rank: number;
                  name: string;
                  rd: boolean;
                  order: boolean;
                }) => (
                  <Tr key={user.uid}>
                    <Td>{user.rank}</Td>
                    <Td>{user.name}</Td>
                    <Td>
                      <Button
                        colorScheme={user.rd ? "facebook" : "gray"}
                        size="sm"
                        onClick={() => isAuthToggle(user, "rd")}
                      >
                        {user.rd ? "有効" : "無効"}
                      </Button>
                    </Td>
                    <Td>
                      <Button
                        colorScheme={user.order ? "facebook" : "gray"}
                        size="sm"
                        onClick={() => isAuthToggle(user, "order")}
                      >
                        {user.order ? "有効" : "無効"}
                      </Button>
                    </Td>
                    <Td>
                      <EditModal uid={user.uid} />
                    </Td>
                  </Tr>
                )
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default Auth;
