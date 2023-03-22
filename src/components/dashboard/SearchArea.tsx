import { Box, Button, Flex, Heading, Input, Select } from "@chakra-ui/react";
import useSWRImmutable from "swr/immutable";
import { useFormContext } from "react-hook-form";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { FC } from "react";

type Props = {
  onSubmit: any;
  onReset: any;
  client?: string;
};

const SearchArea: FC<Props> = ({ onSubmit, onReset, client }) => {
  const { data: users } = useSWRImmutable(`/api/users/sales`);
  const { register, handleSubmit } = useFormContext();
  const { getUserName } = useGetDisp();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex
        w="full"
        px={6}
        gap={6}
        flexDirection={{ base: "column", lg: "row" }}
      >
        <Box>
          <Heading as="h4" fontSize="md">
            期間を選択
          </Heading>
          <Flex
            mt={3}
            gap={3}
            alignItems="center"
            flexDirection={{ base: "column", lg: "row" }}
          >
            <Flex gap={3} w={{ base: "full", lg: "350px" }}>
              <Input type="date" {...register("start")} />
              <Input type="date" {...register("end")} />
            </Flex>
          </Flex>
        </Box>
        {client && (
          <Box>
            <Heading as="h4" fontSize="md">
              受注先名を検索
            </Heading>
            <Flex
              mt={3}
              gap={3}
              alignItems="center"
              w={{ base: "full" }}
              flexDirection={{ base: "column", lg: "row" }}
            >
              <Input
                w="full"
                placeholder="受注先名を検索"
                {...register("client")}
              />
            </Flex>
          </Box>
        )}
        <Box>
          <Heading as="h4" fontSize="md">
            担当者を選択
          </Heading>
          <Flex
            mt={3}
            gap={3}
            alignItems="center"
            w="full"
            flexDirection={{ base: "column", lg: "row" }}
          >
            <Select placeholder="担当者を選択" {...register("staff")}>
              {users?.contents?.map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserName(user.id)}
                </option>
              ))}
            </Select>
            <Flex gap={3} w="full">
              <Button
                type="submit"
                w={{ base: "full", lg: "80px" }}
                colorScheme="facebook"
              >
                検索
              </Button>
              <Button
                w={{ base: "full", lg: "80px" }}
                variant="outline"
                onClick={onReset}
              >
                クリア
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </form>
  );
};

export default SearchArea;
