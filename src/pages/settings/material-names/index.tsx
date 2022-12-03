import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { materialNamesState } from "../../../../store";
import SettingAddPage from "../../../components/settings/SettingAddPage";

const MaterialNameIndex = () => {
  const [items, setItems] = useState({ name: "" });
  const materialNames = useRecoilValue(materialNamesState);

  return (
    <SettingAddPage
      title="組織名"
      items={items}
      setItems={setItems}
      array={materialNames}
      pathName={"materialNames"}
    />
  );
};

export default MaterialNameIndex;
