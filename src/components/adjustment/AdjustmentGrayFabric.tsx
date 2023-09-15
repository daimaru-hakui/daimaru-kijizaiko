/* eslint-disable react/display-name */
import {
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
import { useEffect, useState, FC, memo } from "react";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import { GrayFabric } from "../../../types";
import { useGrayFabrics } from "../../hooks/useGrayFabrics";

type Props = {
  grayFabric: GrayFabric;
};

export const AdjustmentGrayFabric: FC<Props> = memo(({ grayFabric }) => {
  const { getUserName } = useGetDisp(); //// ？
  const { updateAjustmentGrayFabric } = useGrayFabrics();

  const { quantityValueBold } = useUtil();
  const [items, setItems] = useState<GrayFabric>();

  const handleNumberChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: value });
  };

  useEffect(() => {
    setItems({ ...grayFabric } as GrayFabric);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grayFabric.price, grayFabric.stock]);

  const onReset = (grayFabric: GrayFabric) => {
    setItems({ ...grayFabric });
  };

  return (
    <Tr height="50px">
      <Td>{grayFabric.productNumber}</Td>
      <Td p={1} isNumeric>
        <NumberInput
          mt={1}
          w="90px"
          value={items?.price}
          min={0}
          max={100000}
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
          min={0}
          max={100000}
          value={items?.wip}
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
          min={0}
          max={100000}
          value={items?.stock}
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
            onClick={() => updateAjustmentGrayFabric(items, grayFabric.id)}
          >
            更新
          </Button>
          <GiCancel cursor="pointer" onClick={() => onReset(grayFabric)} />
        </Flex>
      </Td>
    </Tr>
  );
});
