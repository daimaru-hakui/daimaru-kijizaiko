import { Box, Flex, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import { NextPage } from 'next';
type Props = {
  title: string;
  quantity: string | number;
  unit: string;
}

const StatCard: NextPage<Props> = ({ title, quantity, unit }) => {

  return (
    <>
      <Stat p={6} bg="white" rounded="md" boxShadow="md">
        <StatLabel>{title}</StatLabel>
        <StatNumber fontSize="4xl">
          {quantity}
          <Box as="span" fontSize="sm" ml={1}>
            {unit}
          </Box>
        </StatNumber>
      </Stat>
    </>
  )
}

export default StatCard