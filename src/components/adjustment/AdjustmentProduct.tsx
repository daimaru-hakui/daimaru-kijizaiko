import {
  Box,
  Button,
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Td,
  Tr,
} from "@chakra-ui/react";
import { GiCancel } from "react-icons/gi";
import { NextPage } from "next";
import { useEffect } from "react";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useInputProduct } from "../../hooks/UseInputProduct";
import { ProductType } from "../../../types/FabricType";
import { useUtil } from "../../hooks/UseUtil";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentUserState, loadingState } from "../../../store";

type Props = {
  product: ProductType;
};

const AdjustmentProduct: NextPage<Props> = ({ product }) => {
  const { getUserName } = useGetDisp(); //// ？
  const currentUser = useRecoilValue(currentUserState);
  const { items, setItems, handleNumberChange } = useInputProduct();
  const { quantityValueBold } = useUtil();
  const { isAdminAuth, isAuths } = useAuthManagement();
  const setLoading = useSetRecoilState(loadingState);
  const { mathRound2nd, getTodayDate } = useUtil();

  useEffect(() => {
    setItems({ ...product } as ProductType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.price, product.tokushimaStock]);

  const updateAjustmentProduct = async (productId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "products", productId);
      await updateDoc(docRef, {
        price: Number(items.price),
        wip: mathRound2nd(Number(items.wip)),
        externalStock: mathRound2nd(Number(items.externalStock)),
        arrivingQuantity: mathRound2nd(Number(items.arrivingQuantity)),
        tokushimaStock: mathRound2nd(Number(items.tokushimaStock)),
        updatedAt: serverTimestamp(),
        updateUser: currentUser,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onReset = (product: ProductType) => {
    setItems({ ...product });
  };


  return (
    <Tr key={product.id}>
      <Td>{getUserName(product.staff)}</Td>
      <Td>{product.productNumber}</Td>
      <Td>{product?.colorName}</Td>
      {isAuths(["rd"]) && (
        <>
          <Td p={1} isNumeric>
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
          </Td>
          <Td p={1} isNumeric fontWeight={quantityValueBold(product?.wip)}>
            <NumberInput
              mt={1}
              w="90px"
              name="wip"
              defaultValue={0}
              min={0}
              max={100000}
              value={items.wip}
              onChange={(e) => handleNumberChange(e, "wip")}
            >
              <NumberInputField textAlign="right" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Td>
          <Td
            p={1}
            isNumeric
            fontWeight={quantityValueBold(product?.externalStock)}
          >
            <NumberInput
              mt={1}
              w="90px"
              name="externalStock"
              defaultValue={0}
              min={0}
              max={100000}
              value={items.externalStock}
              onChange={(e) => handleNumberChange(e, "externalStock")}
            >
              <NumberInputField textAlign="right" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Td>
          <Td
            p={1}
            isNumeric
            fontWeight={quantityValueBold(product?.arrivingQuantity)}
          >
            <NumberInput
              mt={1}
              w="90px"
              name="arrivingQuantity"
              defaultValue={0}
              min={0}
              max={100000}
              value={items.arrivingQuantity}
              onChange={(e) => handleNumberChange(e, "arrivingQuantity")}
            >
              <NumberInputField textAlign="right" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Td>
        </>
      )}
      <Td
        p={1}
        isNumeric
        fontWeight={quantityValueBold(product?.tokushimaStock)}
      >
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
      </Td>
      <Td flex="1">
        <Flex alignItems="center" gap={3}>
          <Button
            size="xs"
            colorScheme="facebook"
            onClick={() => updateAjustmentProduct(product.id)}
          >
            更新
          </Button>
          <GiCancel cursor="pointer" onClick={() => onReset(product)} />
        </Flex>
      </Td>
    </Tr>
  );
};

export default AdjustmentProduct;
