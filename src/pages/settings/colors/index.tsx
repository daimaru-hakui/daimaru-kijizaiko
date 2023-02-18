import { useRecoilValue } from "recoil";
import { colorsState } from "../../../../store";
import SettingListPage from "../../../components/settings/SettingListPage";

const ColorIndex = () => {
  const colors = useRecoilValue(colorsState);

  return (
    <SettingListPage
      title="色"
      array={colors}
      pathName={"colors"}
      collectionName={"colors"}
    />
  );
};

export default ColorIndex;
