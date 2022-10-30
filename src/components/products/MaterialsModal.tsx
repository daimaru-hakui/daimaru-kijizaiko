import React, { useEffect, useMemo, useState } from "react";
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
import { NextPage } from "next";

type Props = {
  items: {};
  setItems: Function;
};

const MaterialsModal: NextPage<Props> = ({ items, setItems }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [materials, setMaterials] = useState<any>([]);
  const [total, setTotal] = useState(true);

  const list = [
    { id: "t", name: "ポリエステル" },
    { id: "c", name: "綿" },
    { id: "n", name: "ナイロン" },
    { id: "r", name: "レーヨン" },
    { id: "f", name: "麻" },
    { id: "pu", name: "ポリウレタン" },
    { id: "z", name: "指定外繊維" },
  ];

  const handleInputChange = (e: string, name: string) => {
    if (Number(e) === 0) {
      setMaterials((prev: any) => {
        delete prev[name];
        return { ...materials };
      });
    } else {
      setMaterials({ ...materials, [name]: Number(e) });
    }
  };

  useEffect(() => {
    const calcSum = (materials: any) => {
      let sum = list
        .map((m) => materials[m.id] && materials[m.id])
        .filter((m) => m)
        .reduce((prev, current) => (prev = prev + current), 0);
      const result = sum > 100 ? true : false;
      setTotal(result);
    };
    calcSum(materials);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials]);
  console.log("items", items);

  const addMaterials = () => {
    setItems({ ...items, materials });
  };

  return (
    <>
      <Button mt={3} onClick={onOpen}>
        選択
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xs">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>素材の選択</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              {list.map((m: { id: any; name: string }) => (
                <Flex key={m.id} alignItems="center">
                  <Text w="100%">{m.name}</Text>
                  <NumberInput
                    name={m.id}
                    w="100%"
                    defaultValue={materials[m.id] || 0}
                    min={0}
                    max={100}
                    onChange={(e) => handleInputChange(e, m.id)}
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
            <Button disabled={total} colorScheme="blue" onClick={addMaterials}>
              追加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MaterialsModal;
