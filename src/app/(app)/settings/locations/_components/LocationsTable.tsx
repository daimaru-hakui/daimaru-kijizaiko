"use client";

import { FC } from "react";
import { Location } from "../../../../../../types";
import { deleteLocationAction } from "@/app/(app)/settings/actions";
import { MasterTable } from "@/components/settings/MasterTable";
import { locationForm } from "@/components/settings/locations/LocationInputArea";
import { buildLocationCsv } from "@/lib/settings/csv";

type Props = {
  locations: Location[];
};

export const LocationsTable: FC<Props> = ({ locations }) => (
  <MasterTable
    rows={locations}
    columns={[
      { header: "順番", key: "order" },
      { header: "保管場所", key: "name" },
    ]}
    csvFilename="徳島保管場所一覧"
    buildCsv={buildLocationCsv}
    deleteAction={deleteLocationAction}
    form={locationForm}
  />
);
