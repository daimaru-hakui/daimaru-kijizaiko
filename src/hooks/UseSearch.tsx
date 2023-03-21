import { Box, Button, Flex, Heading, Input, Select } from "@chakra-ui/react";
import React, { useState } from "react";
import { useGetDisp } from "./UseGetDisp";
import { useUtil } from "./UseUtil";

const useSearch = () => {
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate, get3monthsAgo } = useUtil();
  const { getUserName } = useGetDisp();
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const [client, setClient] = useState("");
  const [items, setItems] = useState({ start: startDay, end: endDay, staff: "", client: '' });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };


  const onSearch = () => {
    setStartDay(items.start);
    setEndDay(items.end);
    setStaff(items.staff);
    setClient(items.client);
  };

  const onReset = () => {
    setStartDay(get3monthsAgo());
    setEndDay(getTodayDate());
    setStaff("");
    setClient("");
    setItems({ start: startDay, end: endDay, staff: "", client: '' });
  };

  const SearchElement = () => (
    <Box>
      <Heading as="h4" fontSize="md">
        期間を選択
      </Heading>
      <Flex
        mt={3}
        gap={3}
        alignItems="center"
        flexDirection={{ base: "column", md: "row" }}
      >
        <Flex gap={3} w={{ base: "full", md: "350px" }}>
          <Input
            type="date"
            name="start"
            value={items.start}
            onChange={handleInputChange}
          />
          <Input
            type="date"
            name="end"
            value={items.end}
            onChange={handleInputChange}
          />
        </Flex>
        <Button
          w={{ base: "full", md: "80px" }}
          px={6}
          colorScheme="facebook"
          onClick={onSearch}
        >
          検索
        </Button>
      </Flex>
    </Box>
  );

  return {
    startDay,
    endDay,
    staff,
    client,
    items,
    setItems,
    SearchElement,
  };
};

export default useSearch;
