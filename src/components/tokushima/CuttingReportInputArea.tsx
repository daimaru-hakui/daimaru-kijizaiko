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
import { CuttingProductType } from "../../../types/CuttingProductType";
import { CuttingReportType } from "../../../types/CuttingReportType";
import { FabricsUsedInput } from "./FabricsUsedInput";
import { useCuttingReportFunc } from "../../hooks/UseCuttingReportFunc";
import { useInputCuttingReport } from "../../hooks/UseInputCuttingReport";
import { UserType } from "../../../types/UserType";
import useSWRImmutable from "swr/immutable";

type Props = {
  title: string;
  pageType: string;
  report: CuttingReportType;
  onClose?: Function;
  startDay?: string;
  endDay?: string;
  staff?: string;
  client?: string;
};

const CuttingReportInputArea: NextPage<Props> = ({
  title,
  pageType,
  report,
  onClose,
  startDay,
  endDay,
  staff,
  client
}) => {
  const users = useRecoilValue(usersState);
  const { data, mutate } = useSWRImmutable(`/api/cutting-reports/${startDay}/${endDay}?staff=${staff}&client=${client}`);
  const [filterUsers, setFilterUsers] = useState([] as UserType[]);
  const [isValidate, setIsValidate] = useState(true);
  const [isLimitQuantity, setIsLimitQuantity] = useState(true);
  const {
    items,
    setItems,
    handleInputChange,
    handleNumberChange,
    handleRadioChange,
  } = useInputCuttingReport();
  const { addInput, addCuttingReport, updateCuttingReport } =
    useCuttingReportFunc(items, setItems, startDay, endDay);

  useEffect(() => {
    setItems({ ...report });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  useEffect(() => {
    setFilterUsers(users.filter((user: UserType) => user.sales));
  }, [users]);

  useEffect(() => {
    const productNumberValidate = () => {
      const array = items?.products?.map(
        (product: CuttingProductType) => product.productId
      );
      const setArray = new Set(array);
      if (array?.length === Array.from(setArray).length) {
        return false;
      } else {
        return true;
      }
    };
    const itemType = items.itemType === "" ? true : false;
    const totalQuantity = items.totalQuantity === 0 ? true : false;
    const category = items?.products?.some(
      (product) => product?.category === ""
    );
    const productId = items?.products?.some(
      (product) => product?.productId === ""
    );
    const quantity = items?.products?.some(
      (product) => product?.quantity === 0 || String(product?.quantity) === "0"
    );
    setIsValidate(
      productNumberValidate() ||
      itemType ||
      totalQuantity ||
      category ||
      productId ||
      quantity
    );
  }, [items]);

  return (
    <>
      <Box as="h1" fontSize="2xl">
        {title}
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
            <Box as="span" color="red">
              ※
            </Box>
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
              onChange={handleInputChange}
            />
          </Box>
          <Box w="full">
            <Text fontWeight="bold">加工指示書NO.</Text>
            <Input
              mt={1}
              type="text"
              name="processNumber"
              value={items.processNumber}
              onChange={handleInputChange}
            />
          </Box>
          <Box w="full">
            <Text fontWeight="bold">担当者</Text>
            <Select
              mt={1}
              placeholder="担当者名を選択"
              value={items.staff}
              name="staff"
              onChange={handleInputChange}
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
          <Input
            mt={1}
            type="text"
            name="client"
            value={items.client}
            onChange={handleInputChange}
          />
        </Box>
        <Box>
          <Text fontWeight="bold">製品名</Text>
          <Input
            mt={1}
            type="text"
            name="itemName"
            value={items.itemName}
            onChange={handleInputChange}
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
            <Text fontWeight="bold">
              総枚数
              <Box as="span" color="red">
                ※
              </Box>
            </Text>
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
            reportId={report.id}
            setIsLimitQuantity={setIsLimitQuantity}
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
        onClick={async () => {
          if (pageType === "new") {
            addCuttingReport();
          }
          if (pageType === "edit") {
            await updateCuttingReport(report.id);
            await onClose();
            await mutate({ ...data }); //必要
          }
        }}
      >
        {pageType === "new" && "登録する"}
        {pageType === "edit" && "更新する"}
      </Button>
    </>
  );
};

export default CuttingReportInputArea;
