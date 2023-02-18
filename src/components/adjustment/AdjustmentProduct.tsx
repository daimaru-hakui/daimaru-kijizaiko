import { Box, Button, Flex, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Td, Tr } from "@chakra-ui/react";
import { GiCancel } from "react-icons/gi";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { db } from "../../../firebase";
import { loadingState } from "../../../store";
import { useGetDisplay } from "../../hooks/useGetDisplay";
import { useInputHandle } from "../../hooks/UseInputHandle";
import { ProductType } from "../../../types/ProductType";

type Props = {
  product: ProductType
};

const AdjustmentProduct: NextPage<Props> = ({ product }) => {
  const setLoading = useSetRecoilState(loadingState);
  // const [items, setItems] = useState({ price: product.price, tokushimaStock: product.tokushimaStock })
  const { items, setItems, handleNumberChange } = useInputHandle()
  const { getUserName } = useGetDisplay()

  useEffect(() => {
    setItems({ price: product.price, tokushimaStock: product.tokushimaStock });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.price, product.tokushimaStock]);


  const quantityBold = (quantity: number) => {
    return quantity > 0 ? "bold" : "normal";
  };

  const updateStock = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "products", product.id);
      await updateDoc(docRef, {
        price: Number(items.price),
        tokushimaStock: Number(items.tokushimaStock),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setItems({ price: product.price, tokushimaStock: product.tokushimaStock });
  };

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
      <Td isNumeric fontWeight={quantityBold(product?.tokushimaStock)}>
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
          <Button size="xs" colorScheme="facebook" onClick={updateStock}>
            更新
          </Button>
          <GiCancel cursor="pointer" onClick={reset} />
        </Flex>
      </Td>
    </Tr>
  );
};

export default AdjustmentProduct;
