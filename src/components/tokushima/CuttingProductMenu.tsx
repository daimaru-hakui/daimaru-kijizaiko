import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { NextPage } from "next";
import { FaEllipsisV } from "react-icons/fa";
import ProductCuttingHistoryModal from "../products/ProductCuttingHistoryModal";
import ProductPurchaseHistoryModal from "../products/ProductPurchaseHistoryModal";

type Props = {
  productId: string;
};

const CuttingProductMenu: NextPage<Props> = ({ productId }) => {
  return (
    <Menu>
      <MenuButton p={1} rounded="md" _active={{ bg: "gray.200" }}>
        <FaEllipsisV />
      </MenuButton>
      <MenuList>
        <MenuItem>
          <ProductCuttingHistoryModal productId={productId} type={null} />
        </MenuItem>
        <MenuItem>
          <ProductPurchaseHistoryModal productId={productId} type={null} />
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default CuttingProductMenu;
