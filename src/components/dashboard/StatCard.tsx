import { Box, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import { NextPage } from 'next';
type Props = {
  title: string;
  quantity: string | number;
  unit: string;
  fontSize: string
}

const StatCard: NextPage<Props> = ({ title, quantity, unit, fontSize }) => {

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
  )
}

export default StatCard