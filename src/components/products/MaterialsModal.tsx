/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, FC } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Text,
  Flex,
  NumberInput,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
  Stack,
} from "@chakra-ui/react";
import { Materials } from "../../../types";

type Props = {
  materials: Materials;
  setMaterials: Function;
};

export const MaterialsModal: FC<Props> = ({ materials, setMaterials }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState<Materials>();
  const [isTotal, setIsTotal] = useState(true);

  const list = [
    { id: "t", name: "ポリエステル" },
    { id: "c", name: "綿" },
    { id: "n", name: "ナイロン" },
    { id: "r", name: "レーヨン" },
    { id: "h", name: "麻" },
    { id: "pu", name: "ポリウレタン" },
    { id: "w", name: "ウール" },
    { id: "ac", name: "アクリル" },
    { id: "cu", name: "キュプラ" },
    { id: "si", name: "シルク" },
    { id: "as", name: "アセテート" },
    { id: "z", name: "指定外繊維" },
    { id: "f", name: "複合繊維" },
  ];

  useEffect(() => {
    setItems({ ...materials });
  }, []);

  const handleInputChange = (e: string, name: string) => {
    if (Number(e) === 0) {
      setItems((prev) => {
        delete prev[name];
        return { ...items };
      });
    } else {
      setItems({ ...items, [name]: Number(e) });
    }
  };

  useEffect(() => {
    const calcSum = (materials: Materials | {} = {}) => {
      let sum = 0;
      Object.values(materials).forEach((value) => {
        sum += Number(value);
      });
      const result = sum !== 100 ? true : false;
      setIsTotal(result);
    };
    calcSum(items);
  }, [items]);

  const addMaterials = () => {
    setMaterials({ ...items });
  };

  return (
    <>
      <Button mt={1} variant="outline" colorScheme="facebook" onClick={onOpen}>
        選択
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>素材の選択</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              {list.map((material) => (
                <Flex key={material?.id} align="center">
                  <Text w="100%">{material?.name}</Text>
                  <NumberInput
                    name={material?.id}
                    w="100%"
                    defaultValue={material?.id || ""}
                    value={
                      items &&
                      (items[material?.id] === 0 ? "" : items[material?.id])
                    }
                    min={0}
                    max={100}
                    onChange={(e) => handleInputChange(e, material.id)}
                  >
                    <NumberInputField textAlign="right" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Flex>
              ))}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              閉じる
            </Button>
            <Button
              disabled={isTotal}
              colorScheme="blue"
              onClick={() => {
                addMaterials();
                onClose();
              }}
            >
              追加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
