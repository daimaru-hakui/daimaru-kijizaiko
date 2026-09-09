"use client";

import { FC } from "react";
import { Supplier } from "../../../../../../types";
import { deleteSupplierAction } from "@/app/(app)/settings/actions";
import { MasterTable } from "@/components/settings/MasterTable";
import { supplierForm } from "@/components/settings/suppliers/SupplierInputArea";
import { buildSupplierCsv } from "@/lib/settings/csv";

type Props = {
  suppliers: Supplier[];
};

export const SuppliersTable: FC<Props> = ({ suppliers }) => (
  <MasterTable
    rows={suppliers}
    columns={[
      { header: "仕入先名", key: "name" },
      { header: "フリガナ", key: "kana" },
    ]}
    csvFilename="仕入先一覧"
    buildCsv={buildSupplierCsv}
    deleteAction={deleteSupplierAction}
    form={supplierForm}
  />
);
