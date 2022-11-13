import React from 'react';
import { Box, Divider, List, ListItem } from '@chakra-ui/react';
import Link from 'next/link';
const MenuLists = () => {
  const menuKiji = [
    { id: 1, title: '一覧', link: '/products' },
    { id: 2, title: '登録', link: '/products/new' },
  ];
  const menuOrder = [
    { id: 2, title: '出庫・入庫・キープ・移管', link: '/order/new' },
    { id: 3, title: '入出庫履歴照会', link: '/order' },
  ];
  const menuMaker = [
    { id: 1, title: '一覧', link: '/suppliers' },
    { id: 2, title: '登録', link: '/suppliers/new' },
  ];
  return (
    <>
      <List my={3} spacing={3}>
        <ListItem fontSize='sm'>
          <Link href='/products'>トップページ</Link>
        </ListItem>
        <ListItem fontSize='sm'>
          <Link href='/auth'>権限</Link>
        </ListItem>
      </List>
      <Divider />

      <Box as='h3' mt={3} fontSize='sm' fontWeight='bold'>
        入出庫
      </Box>
      <List my={3} ml={3} spacing={3} fontSize='sm'>
        {menuOrder.map((m) => (
          <ListItem key={m.id}>
            <Link href={m.link}>{m.title}</Link>
          </ListItem>
        ))}
      </List>
      <Divider />

      <Box as='h3' mt={3} fontSize='sm' fontWeight='bold'>
        生地
      </Box>
      <List my={3} ml={3} spacing={3} fontSize='sm'>
        {menuKiji.map((m) => (
          <ListItem key={m.id}>
            <Link href={m.link}>{m.title}</Link>
          </ListItem>
        ))}
      </List>
      <Divider />

      <Box as='h3' mt={3} fontSize='sm' fontWeight='bold'>
        仕入先
      </Box>
      <List mt={3} ml={3} spacing={3} fontSize='sm'>
        {menuMaker.map((m) => (
          <ListItem key={m.id}>
            <Link href={m.link}>{m.title}</Link>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default MenuLists;
