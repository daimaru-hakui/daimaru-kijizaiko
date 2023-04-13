import { FC } from "react";
import { Box, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
type Props = {
  title: string;
  quantity: string | number;
  unit: string;
  fontSize: string;
};

export const StatCard: FC<Props> = ({ title, quantity, unit, fontSize }) => {
  return (
    <>
      <Stat p={3} bg="white" rounded="md" boxShadow="md">
        <StatLabel>{title}</StatLabel>
        <StatNumber fontSize={{ base: "2xl", sm: fontSize }}>
          {quantity}
          <Box as="span" fontSize="sm" ml={1}>
            {unit}
          </Box>
        </StatNumber>
      </Stat>
    </>
  );
};
