import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { FC } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { MenuLists } from "./MenuLists";

export const MenuDrawerButton: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        display={{ base: "block", "2xl": "none" }}
        colorScheme="facebook"
        variant="outline"
        onClick={onOpen}
      >
        <AiOutlineMenu />
      </Button>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>

          <DrawerBody pr={0}>
            <MenuLists onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
