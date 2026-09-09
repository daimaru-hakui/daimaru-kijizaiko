"use client";

import { FC } from "react";
import { StockPlace } from "../../../../../../types";
import { deleteStockPlaceAction } from "@/app/(app)/settings/actions";
import { MasterTable } from "@/components/settings/MasterTable";
import { stockPlaceForm } from "@/components/settings/stock-places/StockPlaceInputArea";
import { buildStockPlaceCsv } from "@/lib/settings/csv";

const PROTECTED_ID = "ifk1EZX80Jecxy04fqxu";

type Props = {
  stockPlaces: StockPlace[];
};

export const StockPlacesTable: FC<Props> = ({ stockPlaces }) => (
  <MasterTable
    rows={stockPlaces}
    columns={[
      { header: "送り先名", key: "name" },
      { header: "フリガナ", key: "kana" },
      { header: "住所", key: "address" },
      { header: "TEL", key: "tel" },
      { header: "FAX", key: "fax" },
    ]}
    csvFilename="送り先一覧"
    buildCsv={buildStockPlaceCsv}
    deleteAction={deleteStockPlaceAction}
    canDelete={(sp) => sp.id !== PROTECTED_ID}
    actionsHeader="編集/削除"
    form={stockPlaceForm}
  />
);
