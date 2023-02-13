import { Box, Button, Flex, Input, Td, Tr } from "@chakra-ui/react";
import { GiCancel } from "react-icons/gi";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../../firebase";
import { loadingState, usersState } from "../../../store";
import { ProductType } from "../../../types/productType";

type Props = {
  product: ProductType;
};

type ItemsType = {
  tokushimaStock: number;
  price: number;
};

const AdjustmentProduct: NextPage<Props> = ({ product }) => {
  const users = useRecoilValue(usersState);
  const setLoading = useSetRecoilState(loadingState);
  const [items, setItems] = useState({} as ItemsType);

  useEffect(() => {
    setItems({ price: product.price, tokushimaStock: product.tokushimaStock });
  }, [product.price, product.tokushimaStock]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  // 担当者の表示
  const displayName = (userId: string) => {
    if (userId === "R&D") {
      return "R&D";
    } else {
      const user = users.find((user: { uid: string }) => userId === user.uid);
      return user?.name;
    }
  };

  const quantityBold = (quantity: number) => {
    return quantity > 0 ? "bold" : "normal";
  };

  const updateStock = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "products", product.id);
      await updateDoc(docRef, {
        price: items.price,
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
      <Td>{displayName(product.staff)}</Td>
      <Td>{product.productNumber}</Td>
      <Td>{product?.colorName}</Td>
      <Td isNumeric>
        <Input
          type="text"
          name="price"
          w="80px"
          textAlign="right"
          value={items.price || 0}
          onChange={(e) => handleInputChange(e)}
        />
        <Box as="span" ml={2}>
          円
        </Box>
      </Td>
      <Td isNumeric fontWeight={quantityBold(product?.tokushimaStock)}>
        <Input
          type="text"
          name="tokushimaStock"
          w="80px"
          textAlign="right"
          value={items.tokushimaStock || 0}
          onChange={(e) => handleInputChange(e)}
        />
        <Box as="span" ml={2}>
          m
        </Box>
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
