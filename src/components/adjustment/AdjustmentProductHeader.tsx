import { Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { useAuthManagement } from '../../hooks/UseAuthManagement';

export const AdjustmentProductHeader = () => {
  const { isAuths } = useAuthManagement();
  return (
    <Thead
      w="100%"
      position="sticky"
      top={0}
      zIndex="docked"
      bg="white"
    >
      <Tr>
        <Th>担当</Th>
        <Th>生地品番</Th>
        <Th>色</Th>
        {isAuths(["rd", "tokushima"]) && (
          <>
            {isAuths(["rd"]) && (
              <>
                <Th>単価（円）</Th>
                <Th>染め仕掛(m)</Th>
                <Th>外部在庫(m)</Th>
                <Th>入荷待ち(m)</Th>
              </>
            )}
            <Th>徳島在庫(m)</Th>
            <Th>処理</Th>
          </>
        )}
      </Tr>
    </Thead>
  );
}

