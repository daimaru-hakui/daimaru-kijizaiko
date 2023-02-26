import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { NextPage } from 'next';
import { FaEllipsisV } from "react-icons/fa";
import { useRecoilValue } from 'recoil';
import { currentUserState } from '../../../store';
import { ProductType } from '../../../types/FabricType';
import { useAuthManagement } from '../../hooks/UseAuthManagement';
import ProductCuttingHistoryModal from './ProductCuttingHistoryModal';
import ProductEditModal from './ProductEditModal';
import ProductPurchaseHistoryModal from './ProductPurchaseHistoryModal';

type Props = {
  product: ProductType;
};


const ProductMenu: NextPage<Props> = ({ product }) => {
  const currentUser = useRecoilValue(currentUserState)
  const { isAuths } = useAuthManagement()

  return (
    <Menu>
      <MenuButton p={1} rounded='md' _active={{ bg: "gray.200" }}>
        <FaEllipsisV />
      </MenuButton>
      <MenuList >
        {(isAuths(["rd"]) || currentUser === product.createUser) && <MenuItem><ProductEditModal product={product} type={null} /></MenuItem>}
        <MenuItem><ProductCuttingHistoryModal productId={product.id} type={null} /></MenuItem>
        <MenuItem><ProductPurchaseHistoryModal productId={product.id} type={null} /></MenuItem>
      </MenuList>
    </Menu>
  )
}

export default ProductMenu