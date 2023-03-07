import { Box, Button, Flex, Heading, Input } from "@chakra-ui/react";
import React, { useState } from "react";
import { useUtil } from "./UseUtil";

const useSearch = () => {
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate } = useUtil();
  const [startDay, setStartDay] = useState(INIT_DATE);
  const [endDay, setEndDay] = useState(getTodayDate());
  const [items, setItems] = useState({ start: startDay, end: endDay });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const onSearch = () => {
    setStartDay(items.start);
    setEndDay(items.end);
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
    handleInputChange,
    onSearch,
    items,
    setItems,
    SearchElement,
  };
};

export default useSearch;
