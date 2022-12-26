import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { colorsState } from "../../../../store";
import SettingAddPage from "../../../components/settings/SettingAddPage";

const ColorIndex = () => {
  const [items, setItems] = useState({ name: "" });
  const [colors, setColors] = useRecoilState(colorsState);

  return (
    <SettingAddPage
      title="色"
      items={items}
      setItems={setItems}
      array={colors}
      pathName={"colors"}
    />
  );
};

export default ColorIndex;
