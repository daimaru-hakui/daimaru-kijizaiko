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
import { useUtil } from "../../hooks/UseUtil";
import { GrayFabricType } from "../../../types/GrayFabricType";
import { useGrayFabricFunc } from "../../hooks/UseGrayFabricFunc";
import { useInputGrayFabric } from "../../hooks/UseInputGrayFabric";

type Props = {
  grayFabric: GrayFabricType;
};

const AdjustmentGrayFabric: NextPage<Props> = ({ grayFabric }) => {
  const { getUserName } = useGetDisp(); //// ？
  const { items, setItems, handleNumberChange } = useInputGrayFabric();
  const { updateAjustmentGrayFabric, onReset } = useGrayFabricFunc(
    items,
    setItems
  );
  const { quantityValueBold } = useUtil();

  useEffect(() => {
    setItems({ ...grayFabric } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grayFabric.price, grayFabric.stock]);

  return (
    <Tr key={grayFabric.id}>
      <Td>{grayFabric.productNumber}</Td>

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
      <Td p={1} isNumeric fontWeight={quantityValueBold(grayFabric?.wip)}>
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
      <Td p={1} isNumeric fontWeight={quantityValueBold(grayFabric?.stock)}>
        <NumberInput
          mt={1}
          w="90px"
          name="stock"
          defaultValue={0}
          min={0}
          max={100000}
          value={items.stock}
          onChange={(e) => handleNumberChange(e, "stock")}
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
            onClick={() => updateAjustmentGrayFabric(grayFabric.id)}
          >
            更新
          </Button>
          <GiCancel cursor="pointer" onClick={() => onReset(grayFabric)} />
        </Flex>
      </Td>
    </Tr>
  );
};

export default AdjustmentGrayFabric;
