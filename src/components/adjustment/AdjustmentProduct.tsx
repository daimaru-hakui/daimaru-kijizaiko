import { Box, Button, Flex, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Td, Tr } from "@chakra-ui/react";
import { GiCancel } from "react-icons/gi";
import { NextPage } from "next";
import { useEffect } from "react";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useInputProduct } from "../../hooks/UseInputProduct";
import { ProductType } from "../../../types/FabricType";
import { useProductFunc } from "../../hooks/UseProductFunc";
import { useUtil } from "../../hooks/UseUtil";

type Props = {
  product: ProductType
};

const AdjustmentProduct: NextPage<Props> = ({ product }) => {
  const { getUserName } = useGetDisp()//// ？
  const { items, setItems, handleNumberChange } = useInputProduct()
  const { updateAjustmentProduct, onReset } = useProductFunc(items, setItems)
  const { quantityValueBold } = useUtil()

  useEffect(() => {
    setItems({ ...product } as ProductType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.price, product.tokushimaStock]);

  return (
    <Tr key={product.id}>
      <Td>{getUserName(product.staff)}</Td>
      <Td>{product.productNumber}</Td>
      <Td>{product?.colorName}</Td>
      <Td isNumeric>
        <Flex alignItems="center">
          <NumberInput
            mt={1}
            w="90px"
            name="price"
            defaultValue={0}
            min={0}
            max={100000}
            value={items.price}
            onChange={(e) => handleNumberChange(e, "price")}
          >
            <NumberInputField textAlign="right" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Box as="span" ml={2}>
            円
          </Box>
        </Flex>
      </Td>
      <Td isNumeric fontWeight={quantityValueBold(product?.tokushimaStock)}>
        <Flex alignItems="center">
          <NumberInput
            mt={1}
            w="90px"
            name="tokushimaStock"
            defaultValue={0}
            min={0}
            max={100000}
            value={items.tokushimaStock}
            onChange={(e) => handleNumberChange(e, "tokushimaStock")}
          >
            <NumberInputField textAlign="right" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Box as="span" ml={2}>
            m
          </Box>
        </Flex>
      </Td>
      <Td>
        <Flex alignItems="center" gap={3}>
          <Button size="xs" colorScheme="facebook" onClick={() => updateAjustmentProduct(product.id)}>
            更新
          </Button>
          <GiCancel cursor="pointer" onClick={() => onReset(product)} />
        </Flex>
      </Td>
    </Tr>
  );
};

export default AdjustmentProduct;
