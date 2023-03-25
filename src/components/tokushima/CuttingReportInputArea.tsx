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
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { usersState } from "../../../store";
import {
  UserType,
  CuttingProductType,
  CuttingReportType,
} from "../../../types";
import { FabricsUsedInput } from "./FabricsUsedInput";
import { useCuttingReportFunc } from "../../hooks/UseCuttingReportFunc";
import { useForm } from "react-hook-form";

type Props = {
  title: string;
  pageType: string;
  report: CuttingReportType;
  onClose?: Function;
  startDay?: string;
  endDay?: string;
};

const CuttingReportInputArea: NextPage<Props> = ({
  title,
  pageType,
  report,
  onClose,
  startDay,
  endDay,
}) => {
  const users = useRecoilValue(usersState);
  const [filterUsers, setFilterUsers] = useState([] as UserType[]);
  const [isValidate, setIsValidate] = useState(true);
  const [isLimitQuantity, setIsLimitQuantity] = useState(true);
  const [items, setItems] = useState([] as any);
  const { addCuttingReport, updateCuttingReport } =
    useCuttingReportFunc(startDay, endDay);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: {
      ...report
    }
  });

  const [totalQuantity, setTotalQuantity] = useState(0);
  useEffect(() => {
    setTotalQuantity(report.totalQuantity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 商品登録項目を追加
  const addInput = () => {
    setItems([
      ...items,
      { category: "", productId: "", quantity: 0 },
    ]);
  };

  const onSubmit = async (data) => {
    console.log(data);
    switch (pageType) {
      case "new":
        await addCuttingReport(data, items);
        return;
      case "edit":
        await updateCuttingReport(data, items, report.id);
        await onClose();
        return;
      default:
        return;
    }
  };

  useEffect(() => {
    setItems([...report.products]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);


  useEffect(() => {
    setFilterUsers(users.filter((user: UserType) => user.sales));
  }, [users]);


  useEffect(() => {
    const productNumberValidate = () => {
      const array = items?.map(
        (product: CuttingProductType) => product.productId
      );
      const setArray = new Set(array);
      if (array?.length === Array.from(setArray).length) {
        return false;
      } else {
        return true;
      }
    };
    const totalQuantity = items.totalQuantity === 0 ? true : false;
    const category = items?.some(
      (product) => product?.category === ""
    );
    const productId = items?.some(
      (product) => product?.productId === ""
    );
    const quantity = items?.some(
      (product) => product?.quantity === 0 || String(product?.quantity) === "0"
    );
    setIsValidate(
      productNumberValidate() ||
      totalQuantity ||
      category ||
      productId ||
      quantity
    );
  }, [items, setItems]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box as="h1" fontSize="2xl">
        {title}
      </Box>
      <Stack spacing={6} mt={6}>
        <RadioGroup
          defaultValue="1"
          {...register("itemType", { required: true })}
          onChange={() => getValues("itemType")}
        >
          <Stack direction="row">
            <Radio value="1"  {...register("itemType")}>既製品</Radio>
            <Radio value="2"  {...register("itemType")}>別注品</Radio>
            <Box as="span" color="red">
              ※
            </Box>
          </Stack>
        </RadioGroup>
        <Flex gap={3} flexDirection={{ base: "column", md: "row" }}>
          <Box w="full">
            <Text fontWeight="bold">裁断日</Text>
            <Input mt={1} type="date"
              {...register("cuttingDate")}
            />
          </Box>
          <Box w="full">
            <Text fontWeight="bold">加工指示書NO.</Text>
            <Input mt={1} type="text"
              {...register("processNumber")}
            />
          </Box>
          <Box w="full">
            <Text fontWeight="bold">担当者</Text>
            <Select mt={1} placeholder="担当者名を選択"
              {...register("staff")}
            >
              {filterUsers?.map((user: { id: string; name: string; }) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>
        <Box>
          <Text fontWeight="bold">受託先名</Text>
          <Input mt={1} {...register("client")}
          />
        </Box>
        <Box>
          <Text fontWeight="bold">製品名</Text>
          <Input mt={1} {...register("itemName")}
          />
        </Box>
        <Box>
          <Text fontWeight="bold">明細</Text>
          <Textarea mt={1} {...register("comment")}
          />
        </Box>
        <Flex gap={3}>
          <Box>
            <Text fontWeight="bold">
              総枚数
              <Box as="span" color="red">
                ※
              </Box>
            </Text>
            <NumberInput
              mt={1}
              defaultValue={0}
              {...register("totalQuantity")}
              onChange={(e: any) => setTotalQuantity(e)}
              min={0}
              max={10000}
            >
              <NumberInputField textAlign="right" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        </Flex>

        {items.map((product, index) => (
          <FabricsUsedInput
            key={index}
            product={product as CuttingProductType}
            items={items}
            setItems={setItems}
            rowIndex={index}
            reportId={report.id}
            report={report}
            setIsLimitQuantity={setIsLimitQuantity}
            totalQuantity={totalQuantity}
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
        disabled={isValidate || isLimitQuantity}
        type="submit"
      >
        {pageType === "new" && "登録する"}
        {pageType === "edit" && "更新する"}
      </Button>
    </form >
  );
};

export default CuttingReportInputArea;
