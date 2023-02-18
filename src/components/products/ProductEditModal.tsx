import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import { NextPage } from 'next'
import { useState } from 'react'
import { ProductType } from '../../../types/FabricType'
import ProductInputArea from './ProductInputArea'

type Props = {
  product: ProductType
}

const ProductEditModal: NextPage<Props> = ({ product }) => {
  const [items, setItems] = useState({} as any);
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button size='sm' onClick={onOpen}>編集</Button>
      <Modal isOpen={isOpen} onClose={onClose} size='4xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ProductInputArea
              // items={items}
              // setItems={setItems}
              title={"生地の編集"}
              toggleSwitch={"edit"}
              product={product}
              onClose={onClose}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  )
}

export default ProductEditModal