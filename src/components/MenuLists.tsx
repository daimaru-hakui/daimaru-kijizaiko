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
  const { isAdminAuth, isAuths } = useAuthManagement();

  const menuItemEL = (title: string, link: string) => (
    <ListItem
      p={1}
      pl={2}
      rounded="base"
      bg={link == router.pathname ? "blue.50" : "none"}
    >
      <Link href={link} onClick={() => onClose()}>
        {title}
      </Link>
    </ListItem>
  );

  return (
    <Box overflow="auto" h="100%" py={6} pr={6}>
      <List my={2} spacing={1}>
        <ListItem fontSize="sm">
          <Link href="/dashboard" onClick={() => onClose()}>
            トップページ
          </Link>
        </ListItem>
      </List>
      <Divider />
      <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
        生地
      </Box>
      <List my={3} pl={3} spacing={1} fontSize="sm">
        {menuItemEL("生地一覧", "/products")}
        {/* {menuItemEL("生地の発注", "/products/order/new")} */}
        {menuItemEL("染色仕掛一覧", "/products/fabric-dyeing/orders")}
        {menuItemEL("染色履歴一覧", "/products/fabric-dyeing/confirms")}
        {menuItemEL("入荷予定一覧", "/products/fabric-purchase/orders")}
        {menuItemEL("入荷履歴一覧", "/products/fabric-purchase/confirms")}
        {menuItemEL("マスター登録", "/products/new")}
      </List>
      <Divider />

      {isAuths(["rd", "sales"]) && (
        <>
          <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
            キバタ
          </Box>
          <List my={3} pl={3} spacing={1} fontSize="sm">
            {isAuths(["rd", "sales"]) &&
              menuItemEL("キバタ一覧", "/gray-fabrics")}
            {isAuths(["rd", "sales"]) &&
              menuItemEL("キバタ仕掛一覧", "/gray-fabrics/orders")}
            {isAuths(["rd", "sales"]) &&
              menuItemEL("キバタ仕掛履歴", "/gray-fabrics/confirms")}
            {isAuths(["rd"]) && menuItemEL("マスター登録", "/gray-fabrics/new")}
          </List>
          <Divider />
        </>
      )}

      <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
        徳島工場
      </Box>
      <List my={3} pl={3} spacing={1} fontSize="sm">
        {isAuths(["tokushima", "rd"]) &&
          menuItemEL("入荷予定一覧", "/tokushima/fabric-purchase/orders")}
        {isAuths(["tokushima", "rd"]) &&
          menuItemEL("入荷履歴一覧", "/tokushima/fabric-purchase/confirms")}
        {menuItemEL("裁断生地一覧", "/tokushima/cutting-reports/history")}
        {menuItemEL("裁断報告書一覧", "/tokushima/cutting-reports")}
        {isAuths(["tokushima", "rd"]) &&
          menuItemEL("裁断報告書作成", "/tokushima/cutting-reports/new")}
      </List>
      <Divider />

      {isAuths(["accounting"]) && (
        <>
          <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
            経理
          </Box>
          <List my={3} pl={3} spacing={1} fontSize="sm">
            {isAuths(["accounting"]) &&
              menuItemEL("金額確認", "/accounting-dept/orders")}
            {isAuths(["accounting"]) &&
              menuItemEL("処理済み", "/accounting-dept/confirms")}
          </List>
          <Divider />
        </>
      )}
      {isAuths(["rd", "tokushima"]) && (
        <>
          <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
            調整
          </Box>
          <List my={3} pl={3} spacing={1} fontSize="sm">
            {menuItemEL("生地在庫調整", "/adjustment/products")}
          </List>
          {isAuths(["rd"]) && (
            <List my={3} pl={3} spacing={1} fontSize="sm">
              {menuItemEL("キバタ在庫調整", "/adjustment/gray-fabrics")}
            </List>
          )}
          <Divider />
        </>
      )}
      {isAuths(["rd"]) && (
        <>
          <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
            設定
          </Box>
          <List my={3} pl={3} spacing={1} fontSize="sm">
            {menuItemEL("仕入先", "/settings/suppliers")}
            {menuItemEL("送り先", "/settings/stock-places")}
            {menuItemEL("組織名", "/settings/material-Names")}
            {menuItemEL("色", "/settings/colors")}
          </List>
          <Divider />
        </>
      )}
      {isAdminAuth() && (
        <>
          <Box as="h3" mt={3} fontSize="sm" fontWeight="bold">
            権限
          </Box>
          <List my={3} pl={3} spacing={1} fontSize="sm">
            {menuItemEL("権限", "/settings/auth")}
            {menuItemEL("伝票NO.管理", "/serialnumbers")}
          </List>
          <Divider />
        </>
      )}
    </Box>
  );
};

export default MenuLists;
