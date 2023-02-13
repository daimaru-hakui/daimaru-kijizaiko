import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentUserState,
  loadingState,
  productsState,
  usersState,
} from "../../../../store";
import { FabricsUsedInput } from "../../../components/cutting/FabricsUsedInput";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import { CuttingProductType } from "../../../../types/CuttingProductType";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../../../../firebase";

const CuttingReportNew = () => {
  const currentUser = useRecoilValue(currentUserState);
  const users = useRecoilValue(usersState);
  const [validate, setValidate] = useState(true);
  const products = useRecoilValue(productsState);
  const router = useRouter();
  const setLoading = useSetRecoilState(loadingState);
  const [items, setItems] = useState({
    staff: "",
    processNumber: 0,
    itemName: "",
    itemType: "",
    client: "",
    totalQuantity: 0,
    comment: "",
    products: [{ category: "", productId: "", quantity: 0 }],
  } as CuttingReportType);

  //　サンプル
  // useEffect(() => {
  //   const getFetch = async () => {
  //     const response = await fetch("/api/hello", {
  //       method: "GET",
  //       headers: {
  //         API_KEY: process.env.NEXT_PUBLIC_BACKEND_API_KEY || "",
  //       },
  //     });
  //     const result = await response.json();
  //     setSample(result);
  //   };

  //   getFetch();
  // }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  const handleRadioChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  const addInput = () => {
    setItems({
      ...items,
      products: [
        ...items.products,
        { category: "", productId: "", quantity: 0 },
      ],
    });
  };

  // 裁断報告書作成
  const addCuttingReport = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const serialNumberDocRef = doc(db, "serialNumbers", "cuttingReportNumbers");
    const cuttingReportsRef = collection(db, "cuttingReports");

    try {
      runTransaction(db, async (transaction) => {
        const serialNumberDocSnap = await transaction.get(serialNumberDocRef);
        if (!serialNumberDocSnap.exists())
          throw "serialNumberDocSnap does not exist!";
        const newSerialNumber = serialNumberDocSnap.data().serialNumber + 1;

        items.products.map(async (product) => {
          const productDocRef = doc(db, "products", product.productId);
          const productSnap = await getDoc(productDocRef);
          if (!productSnap.exists()) throw "productSnap does not exist!";
          const tokushimaStock = productSnap.data()?.tokushimaStock || 0;
          transaction.update(productDocRef, {
            tokushimaStock: tokushimaStock - Number(product.quantity),
          });
        });

        transaction.update(serialNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        await addDoc(cuttingReportsRef, {
          ...items,
          serialNumber: newSerialNumber,
          createUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
      window.alert("登録失敗");
    } finally {
      setLoading(false);
      router.push("/tokushima/cutting-report");
    }
  };
  useEffect(() => {
    const validate = () => {
      const array = items.products.map((product: any) => product.productId);
      const setArray = new Set(array);
      if (array.length === Array.from(setArray).length) {
        setValidate(false);
      } else {
        setValidate(true);
      }
    };
    validate();
  }, [items]);

  console.log(Number(items.totalQuantity));

  return (
    <Box w="100%" mt={12}>
      <Container maxW="900px" my={6} p={6} bg="white" rounded="md">
        <Box as="h1" fontSize="2xl">
          裁断報告書作成
        </Box>
        <Stack spacing={6} mt={6}>
          <RadioGroup
            defaultValue="1"
            value={String(items.itemType)}
            onChange={(e) => handleRadioChange(e, "itemType")}
          >
            <Stack direction="row">
              <Radio value="1">既製品</Radio>
              <Radio value="2">別注品</Radio>
            </Stack>
          </RadioGroup>
          <Flex gap={3} flexDirection={{ base: "column", md: "row" }}>
            <Box w="full">
              <Text fontWeight="bold">裁断日</Text>
              <Input
                mt={1}
                type="date"
                name="cuttingDate"
                value={items.cuttingDate}
                onChange={(e) => handleInputChange(e)}
              />
            </Box>
            <Box w="full">
              <Text fontWeight="bold">加工指示書NO.</Text>
              <Input
                mt={1}
                type="number"
                name="processNumber"
                value={items.processNumber === 0 ? "" : items.processNumber}
                onChange={(e) => handleInputChange(e)}
              />
            </Box>
            <Box w="full">
              <Text fontWeight="bold">担当者</Text>
              <Select
                mt={1}
                placeholder="担当者名を選択"
                value={items.staff}
                name="staff"
                onChange={(e) => handleInputChange(e)}
              >
                {users?.map((user: { id: string; name: string }) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
          <Box>
            <Text fontWeight="bold">受託先名</Text>
            <Input
              mt={1}
              type="text"
              name="client"
              value={items.client}
              onChange={(e) => handleInputChange(e)}
            />
          </Box>
          <Box>
            <Text fontWeight="bold">製品名</Text>
            <Input
              mt={1}
              type="text"
              name="itemName"
              value={items.itemName}
              onChange={(e) => handleInputChange(e)}
            />
          </Box>
          <Box>
            <Text fontWeight="bold">明細</Text>
            <Textarea
              mt={1}
              name="comment"
              value={items.comment}
              onChange={handleInputChange}
            />
          </Box>
          <Flex gap={3}>
            <Box>
              <Text fontWeight="bold">総枚数</Text>
              <NumberInput
                mt={1}
                name="totalQuantity"
                defaultValue={0}
                min={0}
                max={10000}
                value={items.totalQuantity}
                onChange={(e) => handleNumberChange(e, "totalQuantity")}
              >
                <NumberInputField textAlign="right" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </Flex>

          {items?.products?.map((product, index) => (
            <FabricsUsedInput
              key={index}
              items={items}
              setItems={setItems}
              product={product as CuttingProductType}
              rowIndex={index}
            />
          ))}
          <Flex justifyContent="center">
            <Button leftIcon={<FaPlus />} p={2} mx="auto" onClick={addInput}>
              追加
            </Button>
          </Flex>
        </Stack>
        <Button
          w="full"
          my={12}
          colorScheme="facebook"
          disabled={validate}
          onClick={addCuttingReport}
        >
          送信
        </Button>
      </Container>
    </Box>
  );
};

export default CuttingReportNew;
