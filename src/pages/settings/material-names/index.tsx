import { useRecoilValue } from "recoil";
import { materialNamesState } from "../../../../store";
import SettingListPage from "../../../components/settings/SettingListPage";

const MaterialNameIndex = () => {
  const materialNames = useRecoilValue(materialNamesState);

  return (
    <SettingListPage
      title="組織名"
      array={materialNames}
      pathName={"material-names"}
      collectionName={"materialNames"}
    />
  );
};

export default MaterialNameIndex;
