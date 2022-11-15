import { Box, Button, Container, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';

const index = () => {
  return (
    <Container maxW='900px' p={6} my={6} rounded='md' bg='white' boxShadow='md'>
      <Flex
        gap={1}
        alignItems='center'
        justifyContent='flex-start'
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Box w='100%'>
          <Link href='/settings/color'>
            <Button>色の追加</Button>
          </Link>
        </Box>
        <Box>
          <Link href='/settings/material-name'>
            <Button>組織名の追加</Button>
          </Link>
        </Box>
      </Flex>
    </Container>
  );
};

export default index;
