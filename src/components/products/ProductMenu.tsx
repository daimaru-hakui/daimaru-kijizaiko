import React, { FC } from "react";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { FaEllipsisV } from "react-icons/fa";
import { useAuthStore } from "../../../store";
import { Product } from "../../../types";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { ProductCuttingHistoryModal } from "./ProductCuttingHistoryModal";
import { ProductEditModal } from "./ProductEditModal";
import { ProductPurchaseHistoryModal } from "./ProductPurchaseHistoryModal";

type Props = {
  product: Product;
};

const ProductMenu: FC<Props> = ({ product }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { isAuths } = useAuthManagement();

  return (
    <Menu>
      <MenuButton p={1} rounded="md" _active={{ bg: "gray.200" }}>
        <FaEllipsisV />
      </MenuButton>
      <MenuList>
        {(isAuths(["rd"]) || currentUser === product.createUser) && (
          <MenuItem>
            <ProductEditModal product={product} type={null} />
          </MenuItem>
        )}
        <MenuItem>
          <ProductCuttingHistoryModal productId={product.id} type={null} />
        </MenuItem>
        <MenuItem>
          <ProductPurchaseHistoryModal productId={product.id} type={null} />
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default React.memo(ProductMenu)
