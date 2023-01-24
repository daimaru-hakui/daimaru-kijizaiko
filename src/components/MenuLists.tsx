import React from "react";
import { Box, Divider, List, ListItem } from "@chakra-ui/react";
import Link from "next/link";
import { NextPage } from "next";
import OrderDrawer from "./products/OrderDrawer";

type Props = {
  onClose: Function;
};
const MenuLists: NextPage<Props> = ({ onClose }) => {
  const menu1 = [
    { id: 1, title: "生地一覧", link: "/products" },
    { id: 2, title: <OrderDrawer />, link: "" },
    { id: 3, title: "生地仕掛状況", link: "/products/history/fabric-dyeing" },
    { id: 4, title: "購入状況", link: "/products/history/fabric-purchase" },
    { id: 5, title: "マスター登録", link: "/products/new" },
  ];
  const menu2 = [
    { id: 1, title: "キバタ一覧", link: "/gray-fabrics" },
    { id: 2, title: "キバタ仕掛状況", link: "/gray-fabrics/history" },
    { id: 3, title: "マスター登録", link: "/gray-fabrics/new" },
  ];
  const menu3 = [
    { id: 1, title: "入荷予定一覧", link: "/tokushima/history" },
    { id: 2, title: "裁断報告書", link: "" },
  ];
  const menu4 = [
    { id: 1, title: "権限", link: "/settings/auth/" },
    { id: 2, title: "仕入先", link: "/settings/suppliers/" },
    { id: 3, title: "送り先", link: "/settings/stock-places/" },
    { id: 4, title: "色", link: "/settings/colors/" },
    { id: 5, title: "組織名", link: "/settings/material-names/" },
  ];
  const menu5 = [{ id: 1, title: "金額確認", link: "/accounting-dept/" }];

  const elementMenuList = (
    title: string,
    array: { title: string; link: string }[]
  ) => (
    <>
      <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
        {title}
      </Box>
      <List my={3} ml={3} spacing={1} fontSize="sm">
        {array.map((m, i: number) => (
          <ListItem key={i}>
            <Link href={m.link} onClick={() => onClose()}>
              {m.title}
            </Link>
          </ListItem>
        ))}
      </List>
      <Divider />
    </>
  );

  return (
    <>
      <List my={2} spacing={1}>
        <ListItem fontSize="sm">
          <Link href="/">トップページ</Link>
        </ListItem>
      </List>
      <Divider />

      <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
        生地
      </Box>
      <List my={3} ml={3} spacing={1} fontSize="sm">
        {menu1.map((m, i) => (
          <ListItem key={i}>
            <Link
              href={m.link}
              onClick={() => {
                if (m.id !== 2) {
                  onClose();
                }
              }}
            >
              {m.title}
            </Link>
          </ListItem>
        ))}
      </List>
      <Divider />

      {elementMenuList("キバタ", menu2)}
      {elementMenuList("徳島工場", menu3)}
      {elementMenuList("経理部", menu5)}
      {elementMenuList("設定", menu4)}
    </>
  );
};

export default MenuLists;
