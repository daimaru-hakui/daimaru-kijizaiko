import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React, { useState, useEffect, FC } from "react";
import { StockPlace } from "../../../../types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useForm, SubmitHandler } from "react-hook-form";

type Props = {
  type: string;
  stockPlace: StockPlace;
  addStockPlace?: Function;
  updateStockPlace?: Function;
};

type Inputs = StockPlace;

export const StockPlaceInputArea: FC<Props> = ({
  type,
  stockPlace,
  addStockPlace,
  updateStockPlace,
}: Props) => {
  const [stockPlaces, setStockPlaces] = useState<StockPlace[]>([]);
  const [flag, setFlag] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      ...stockPlace,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    switch (type) {
      case "new":
        addStockPlace(data);
        return;
      case "edit":
        updateStockPlace(data);
        return;
      default:
        return;
    }
  };

  // 登録しているかのチェック
  useEffect(() => {
    if (type === "edit") return;
    let item = watch("name");
    if (!item) item = "noValue";
    const base = stockPlaces?.map((place) => place.name);
    const result = base?.includes(item);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("name")]);

  useEffect(() => {
    const getData = async () => {
      const collectionRef = collection(db, "stockPlaces");
      const docSnap = await getDocs(collectionRef);
      setStockPlaces(
        docSnap.docs.map((doc) => ({ ...doc.data() } as StockPlace))
      );
    };
    getData();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6} mt={6}>
        <Flex gap={6} flexDirection={{ base: "column" }}>
          <Box w="100%" flex={2}>
            <Text>送り先名</Text>
            <Input mt={1} {...register("name", { required: true })} />
            {errors.name && (
              <Box color="red" fontWeight="bold">
                ※送り先を入力してください
              </Box>
            )}
            {flag && (
              <Box color="red" fontWeight="bold">
                ※すでに登録されています。
              </Box>
            )}
          </Box>
          <Box w="100%" flex={1}>
            <Text>フリガナ</Text>
            <Input mt={1} {...register("kana")} />
          </Box>
          <Box w="100%" flex={1}>
            <Text>住所</Text>
            <Input mt={1} {...register("address")} />
          </Box>
          <Flex gap={3}>
            <Box w="100%" flex={1}>
              <Text>TEL</Text>
              <Input mt={1} {...register("tel")} />
            </Box>
            <Box w="100%" flex={1}>
              <Text>FAX</Text>
              <Input mt={1} {...register("fax")} />
            </Box>
          </Flex>
          <Box w="100%" flex={1}>
            <Text>備考</Text>
            <Textarea mt={1} {...register("comment")} />
          </Box>
        </Flex>
        <Button type="submit" disabled={flag} colorScheme="facebook">
          {type === "new" ? "登録" : "更新"}
        </Button>
      </Stack>
    </form>
  );
};
