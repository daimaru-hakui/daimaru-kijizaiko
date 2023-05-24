import { Box } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';

const CuttingReport: NextPage = () => {
  const router = useRouter();
  const id = router.asPath.split('/').pop();



  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} p={6} bg="white" boxShadow="md" rounded="md"></Box>
    </Box>
  );
};

export default CuttingReport;
