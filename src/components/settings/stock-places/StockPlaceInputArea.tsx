"use client";

import { FC } from "react";
import { StockPlace } from "../../../../types";
import { addStockPlaceAction, updateStockPlaceAction } from "@/app/(app)/settings/actions";
import { MasterInputArea, MasterFormConfig } from "@/components/settings/MasterInputArea";

export const stockPlaceForm: MasterFormConfig<StockPlace> = {
  nameLabel: "送り先名",
  nameRequiredMessage: "※送り先を入力してください",
  fields: [
    { name: "kana", label: "フリガナ" },
    { name: "address", label: "住所" },
    [
      { name: "tel", label: "TEL" },
      { name: "fax", label: "FAX" },
    ],
  ],
  addAction: addStockPlaceAction,
  updateAction: updateStockPlaceAction,
  listPath: "/settings/stock-places",
};

type Props = {
  type: "new" | "edit";
  stockPlace: StockPlace;
  /** 新規登録時の重複チェックに使う登録済みの送り先名 */
  existingNames?: string[];
  onSuccess?: () => void;
};

export const StockPlaceInputArea: FC<Props> = ({ stockPlace, ...props }) => (
  <MasterInputArea row={stockPlace} form={stockPlaceForm} {...props} />
);
