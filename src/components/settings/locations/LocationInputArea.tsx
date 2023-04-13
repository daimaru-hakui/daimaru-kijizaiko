import {
  Box,
  Button,
  Flex,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React, { useState, useEffect, FC } from "react";
import { LocationType } from "../../../../types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useForm, SubmitHandler } from "react-hook-form";

type Props = {
  type: string;
  location: LocationType;
  addLocation?: Function;
  updateLocation?: Function;
};

type Inputs = LocationType;

export const LocationInputArea: FC<Props> = ({
  type,
  location,
  addLocation,
  updateLocation,
}: Props) => {
  const [locations, setLocations] = useState([] as LocationType[]);
  const [flag, setFlag] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      ...location,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    switch (type) {
      case "new":
        addLocation(data);
        return;
      case "edit":
        updateLocation(data);
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
    const base = locations?.map((a: { name: string }) => a.name);
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
      const collectionRef = collection(db, "locations");
      const docSnap = await getDocs(collectionRef);
      setLocations(
        docSnap.docs.map((doc) => ({ ...doc.data() } as LocationType))
      );
    };
    getData();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={6} mt={6}>
        <Flex gap={6} flexDirection={{ base: "column" }}>
          <Box w="100%" flex={2}>
            <Text>保管場所名</Text>
            <Input mt={1} {...register("name", { required: true })} />
            {errors.name && (
              <Box color="red" fontWeight="bold">
                ※保管場所を入力してください
              </Box>
            )}
            {flag && (
              <Box color="red" fontWeight="bold">
                ※すでに登録されています。
              </Box>
            )}
          </Box>
          <Box>
            <Text>順番</Text>
            <NumberInput
              {...register("order")}
              onChange={() => getValues}
              min={0}
              max={1000}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
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
