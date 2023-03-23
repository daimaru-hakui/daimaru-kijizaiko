import { useEffect, useState } from "react";
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
  materials: any;
  setMaterials: Function;
};

const MaterialsModal: NextPage<Props> = ({ materials, setMaterials }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(true);

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

  const handleInputChange = (e: string, name: string) => {
    if (Number(e) === 0) {
      setItems((prev: any) => {
        delete prev[name];
        return { ...items };
      });
    } else {
      setItems({ ...items, [name]: Number(e) });
    }
  };

  useEffect(() => {
    const calcSum = (materials: any) => {
      let sum = list
        .map((m) => materials[m.id] && materials[m.id])
        .filter((m) => m)
        .reduce((prev, current) => (prev = prev + current), 0);
      const result = sum !== 100 ? true : false;
      setTotal(result);
    };
    calcSum(materials);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials]);

  useEffect(() => {
    setItems({ ...materials });
  }, [materials]);

  const addMaterials = () => {
    setItems({ ...items });
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
              {list.map((material: { id: any; name: string }) => (
                <Flex key={material.id} alignItems="center">
                  <Text w="100%">{material.name}</Text>
                  <NumberInput
                    name={material.id}
                    w="100%"
                    defaultValue={items[material.id] || ""}
                    value={
                      items &&
                      (items[material.id] === 0 ? "" : items[material.id])
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
              disabled={total}
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

export default MaterialsModal;
