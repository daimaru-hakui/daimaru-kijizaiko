import { Box, Flex, Stat, StatHelpText, StatLabel, StatNumber } from '@chakra-ui/react'
import { NextPage } from 'next';
type Props = {
  title: string;
  quantity: string | number;
  unit: string;
  price: string | number
  subUnit: string
  fontSize: string
}

const StatCard: NextPage<Props> = ({ title, quantity, unit, price, subUnit, fontSize }) => {

  return (
    <>
      <Stat p={6} bg="white" rounded="md" boxShadow="md">
        <StatLabel>{title}</StatLabel>
        <StatNumber fontSize={fontSize}>
          {quantity}
          <Box as="span" fontSize="sm" ml={1}>
            {unit}
          </Box>
        </StatNumber>
        {price && (
          <StatHelpText fontSize="lg">{price}
            <Box as="span" ml={1}>{subUnit}</Box>
          </StatHelpText>
        )}
      </Stat>
    </>
  )
}

export default StatCard