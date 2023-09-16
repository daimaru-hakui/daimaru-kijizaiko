import React, { FC } from 'react';
import { Flex, Input } from '@chakra-ui/react';
import { GiCancel } from "react-icons/gi";

type Props = {
  searchText: string;
  setSearchText: (payload) => void;
};

export const AdjustmentProductSearchBar: FC<Props> = ({ searchText, setSearchText }) => {

  const reset = () => {
    setSearchText("");
  };

  return (
    <Flex mt={6} gap={1} align="center">
      <Input
        type="text"
        size="xs"
        w="32"
        mr={1}
        value={searchText}
        placeholder="品番絞り込み"
        onChange={(e) => setSearchText(e.target.value)}
      />
      <GiCancel cursor="pointer" onClick={reset} />
    </Flex>
  );
};
