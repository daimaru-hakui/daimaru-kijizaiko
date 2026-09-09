"use client";

import { FC } from "react";
import { Location } from "../../../../types";
import { addLocationAction, updateLocationAction } from "@/app/(app)/settings/actions";
import { MasterInputArea, MasterFormConfig } from "@/components/settings/MasterInputArea";

export const locationForm: MasterFormConfig<Location> = {
  nameLabel: "保管場所名",
  nameRequiredMessage: "※保管場所を入力してください",
  fields: [{ name: "order", label: "順番", kind: "number", min: 0, max: 1000 }],
  addAction: addLocationAction,
  updateAction: updateLocationAction,
  listPath: "/settings/locations",
};

type Props = {
  type: "new" | "edit";
  location: Location;
  /** 新規登録時の重複チェックに使う登録済みの保管場所名 */
  existingNames?: string[];
  onSuccess?: () => void;
};

export const LocationInputArea: FC<Props> = ({ location, ...props }) => (
  <MasterInputArea row={location} form={locationForm} {...props} />
);
