import { Box, Button, Divider, List, ListItem } from "@chakra-ui/react";
import Link from "next/link";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useAuthManagement } from "../hooks/UseAuthManagement";

type Props = {
  onClose: Function;
};
const MenuLists: NextPage<Props> = ({ onClose }) => {
  const router = useRouter();
  const { isAdminAuth, isAuth, isAuths } = useAuthManagement();

  const menu1 = [
    { id: 1, title: "生地一覧", link: "/products" },
    { id: 2, title: "生地の発注", link: "/products/order/new" },
    { id: 3, title: "生地仕掛一覧", link: "/products/fabric-dyeing/orders" },
    { id: 4, title: "入荷予定一覧", link: "/products/fabric-purchase/orders" },
    { id: 5, title: "マスター登録", link: "/products/new" },
  ];
  const menu2 = [
    { id: 1, title: "キバタ一覧", link: "/gray-fabrics" },
    { id: 2, title: "キバタ仕掛一覧", link: "/gray-fabrics/history" },
    { id: 3, title: "マスター登録", link: "/gray-fabrics/new" },
  ];
  const menu3 = [
    {
      id: 1,
      title: "入荷予定一覧",
      link: "/tokushima/history/fabric-purchase",
    },
    {
      id: 2,
      title: "裁断生地一覧",
      link: "/tokushima/cutting-reports/history",
    },
    { id: 3, title: "裁断報告書一覧", link: "/tokushima/cutting-reports" },
    { id: 4, title: "裁断報告書作成", link: "/tokushima/cutting-reports/new" },
  ];
  const menu4 = [
    { id: 1, title: "仕入先", link: "/settings/suppliers" },
    { id: 2, title: "送り先", link: "/settings/stock-places" },
    { id: 3, title: "色", link: "/settings/colors" },
    { id: 4, title: "組織名", link: "/settings/material-names" },
  ];
  const menu5 = [{ id: 1, title: "金額確認", link: "/accounting-dept" }];
  const menu6 = [{ id: 1, title: "在庫数量調整", link: "/adjustment" }];
  const menu7 = [
    { id: 1, title: "権限", link: "/settings/auth" },
    { id: 2, title: "伝票NO.管理", link: "/serialnumbers" },
  ];

  const elementMenuList = (
    title: string,
    array: { title: any; link: string; }[]
  ) => (
    <>
      <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
        {title}
      </Box>
      <List my={3} pl={3} spacing={1} fontSize="sm">
        {array.map((m, i: number) => (
          <ListItem
            key={i}
            p={1}
            pl={2}
            rounded="base"
            bg={m?.link == router.pathname ? "blue.50" : "none"}
          >
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
    <Box overflow="auto" h="100%" py={6} pr={6}>
      <List my={2} spacing={1}>
        <ListItem fontSize="sm">
          <Link href="/dashboard" onClick={() => onClose()}>
            トップページ
          </Link>
          <Link href="/products/fabric-purchase/orders">
            <Button size="sm" >仕掛履歴</Button>
          </Link>
        </ListItem>
      </List>
      <Divider />

      {elementMenuList("生地", menu1)}
      {isAuth("rd") && elementMenuList("キバタ", menu2)}
      {isAuth("rd") && elementMenuList("調整", menu6)}
      {isAuth("tokushima") && elementMenuList("徳島工場", menu3)}
      {isAuth("accounting") && elementMenuList("経理部", menu5)}
      {isAuth("rd") && elementMenuList("設定", menu4)}
      {isAdminAuth() && elementMenuList("管理者", menu7)}
    </Box>
  );
};

export default MenuLists;
