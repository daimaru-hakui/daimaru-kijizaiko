import { Box, Button, Flex, Heading, Input, Select } from "@chakra-ui/react";
import React, { useState } from "react";
import useSWRImmutable from "swr/immutable";
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
  const { data: users } = useSWRImmutable(`/api/users/sales`);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  console.log(items);

  const onSearch = () => {
    setStartDay(items.start);
    setEndDay(items.end);
    setStaff(items.staff);
    setClient(items.client);
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

  const SearchExtElement = () => (
    <Flex
      w="full"
      gap={6}
      flexDirection={{ base: "column", md: "row" }}>
      <Box>
        <Heading as="h4" fontSize="md">
          期間を選択
        </Heading>
        <Flex
          mt={3}
          gap={3}
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
        </Flex>
      </Box>
      <Box>
        <Heading as="h4" fontSize="md">
          担当者を選択
        </Heading>
        <Flex
          mt={3}
          gap={3}
          alignItems="center"
          w={{ base: "full", md: "200px" }}
          flexDirection={{ base: "column", md: "row" }}
        >
          <Select
            name="staff"
            value={items.staff}
            placeholder="担当者を選択"
            onChange={handleInputChange}
          >
            {users?.contents?.map((user) => (
              <option key={user.id} value={user.id}>{getUserName(user.id)}</option>
            ))}
          </Select>
        </Flex>
      </Box>
    </Flex>
  );

  return {
    startDay,
    endDay,
    staff,
    client,
    items,
    setItems,
    SearchElement,
    SearchExtElement,
    onSearch
  };
};

export default useSearch;
