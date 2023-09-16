import {
  Box,
  Flex,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";
import { FC, } from "react";
import { useProductsStore } from "../../../store";
import { FaSearch } from "react-icons/fa";
import { User, Product } from "../../../types";
import { useGetDisp } from "../../hooks/UseGetDisp";
import useSWRImmutable from "swr/immutable";

type Props = {
  filterProducts: Product[];
  search: Product;
  setSearch: (payload: Product) => void;
  onReset: () => void;
};

type Users = {
  contents: User[];
};

export const ProductSearchBar: FC<Props> = ({
  filterProducts,
  search,
  setSearch,
  onReset
}) => {
  const products = useProductsStore((state) => state.products);
  const { data: users } = useSWRImmutable<Users>(`/api/users/sales`);
  const { getUserName } = useGetDisp();
  return (
    <Flex
      mt={3}
      gap={3}
      justify="center"
      align="center"
      flexDirection={{ base: "column", lg: "row" }}
    >
      <Select
        placeholder="担当者で検索"
        maxW={300}
        onChange={(e) => setSearch({ ...search, staff: e.target.value })}
        value={search.staff}
      >
        <option value="R&D">R&D</option>
        {users?.contents.map((user) => (
          <option key={user.id} value={user.id}>
            {getUserName(user.id)}
          </option>
        ))}
      </Select>
      <InputGroup maxW={300}>
        <InputLeftElement pointerEvents="none">
          <FaSearch />
        </InputLeftElement>
        <Input
          type="text"
          name="productNumber"
          placeholder="生地の品番を検索..."
          value={search.productNumber}
          onChange={(e) =>
            setSearch({ ...search, productNumber: e.target.value })
          }
        />
      </InputGroup>
      {products?.length !== filterProducts?.length && (
        <Button size="md" colorScheme="facebook" onClick={onReset}>
          解除
        </Button>
      )}
    </Flex>
  );
};
