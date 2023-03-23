import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Select,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { BsFilter } from "react-icons/bs";
import { useRecoilValue } from "recoil";
import { colorsState, materialNamesState } from "../../../store";
import { ProductType } from "../../../types/FabricType";

type Props = {
  search: ProductType;
  setSearch: Function;
  onReset: Function;
};

const ProductSearchArea: NextPage<Props> = ({ search, setSearch, onReset }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const colors = useRecoilValue(colorsState);
  const materialNames = useRecoilValue(materialNamesState);
  return (
    <>
      <Button
        size="sm"
        colorScheme="facebook"
        onClick={onOpen}
        leftIcon={<BsFilter />}
        shadow="md"
      >
        フィルター
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>絞り込み検索</DrawerHeader>

          <DrawerBody>
            <Stack spacing={6}>
              <Box>
                <Text>品番</Text>
                <Input
                  mt={1}
                  type="text"
                  name="productNumber"
                  placeholder="生地の品番を検索..."
                  value={search.productNumber}
                  onChange={(e) =>
                    setSearch({ ...search, productNumber: e.target.value })
                  }
                />
              </Box>
              <Box>
                <Text>色</Text>
                <Select
                  mt={1}
                  name="colorName"
                  placeholder="色を検索..."
                  value={search.colorName}
                  onChange={(e) =>
                    setSearch({ ...search, colorName: e.target.value })
                  }
                >
                  {colors.map((color: string) => (
                    <option key={color}>{color}</option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text>品名</Text>
                <Input
                  mt={1}
                  type="text"
                  name="productName"
                  placeholder="品名を検索..."
                  value={search.productName}
                  onChange={(e) =>
                    setSearch({ ...search, productName: e.target.value })
                  }
                />
              </Box>
              <Box>
                <Text>組織名</Text>
                <Select
                  mt={1}
                  name="materialName"
                  placeholder="色を検索..."
                  value={search.materialName}
                  onChange={(e) =>
                    setSearch({ ...search, materialName: e.target.value })
                  }
                >
                  {materialNames.map((materialName: string) => (
                    <option key={materialName}>{materialName}</option>
                  ))}
                </Select>
              </Box>
              <Button onClick={() => onReset()}>リセット</Button>
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              閉じる
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ProductSearchArea;
