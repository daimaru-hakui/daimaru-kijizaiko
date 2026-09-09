"use client";

import { FC } from "react";
import { Supplier } from "../../../../types";
import { addSupplierAction, updateSupplierAction } from "@/app/(app)/settings/actions";
import { MasterInputArea, MasterFormConfig } from "@/components/settings/MasterInputArea";

export const supplierForm: MasterFormConfig<Supplier> = {
  nameLabel: "仕入先名",
  nameRequiredMessage: "※仕入れ先を入力してください",
  fields: [{ name: "kana", label: "フリガナ" }],
  addAction: addSupplierAction,
  updateAction: updateSupplierAction,
  listPath: "/settings/suppliers",
};

type Props = {
  type: "new" | "edit";
  supplier: Supplier;
  /** 新規登録時の重複チェックに使う登録済みの仕入先名 */
  existingNames?: string[];
  onSuccess?: () => void;
};

export const SupplierInputArea: FC<Props> = ({ supplier, ...props }) => (
  <MasterInputArea row={supplier} form={supplierForm} {...props} />
);
