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
import { Supplier } from "../../../../types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useForm, SubmitHandler } from "react-hook-form";

type Props = {
  type: string;
  supplier: Supplier;
  addSupplier?: Function;
  updateSupplier?: Function;
};

type Inputs = Supplier;

export const SupplierInputArea: FC<Props> = ({
  type,
  supplier,
  addSupplier,
  updateSupplier,
}: Props) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [flag, setFlag] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      ...supplier,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    switch (type) {
      case "new":
        addSupplier(data);
        return;
      case "edit":
        updateSupplier(data);
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
    const base = suppliers?.map((supplier) => supplier.name);
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
      const collectionRef = collection(db, "suppliers");
      const docSnap = await getDocs(collectionRef);
      setSuppliers(docSnap.docs.map((doc) => ({ ...doc.data() } as Supplier)));
    };
    getData();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6} mt={6}>
        <Flex gap={6} flexDirection={{ base: "column" }}>
          <Box w="100%" flex={2}>
            <Text>仕入先名</Text>
            <Input mt={1} {...register("name", { required: true })} />
            {errors.name && (
              <Box color="red" fontWeight="bold">
                ※仕入れ先を入力してください
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
