"use client";

import { FC, useTransition } from "react";
import { Location } from "../../../../../../types";
import { deleteLocationAction } from "@/app/(app)/settings/actions";
import { CommentModal } from "@/components/CommentModal";
import { EditLocationModal } from "@/components/settings/locations/EditModal";
import { FaTrashAlt } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const HEAD = "text-xs font-semibold text-slate-500 tracking-wider";
const HEAD_NOWRAP = `${HEAD} whitespace-nowrap`;

type Props = {
  locations: Location[];
};

export const LocationsTable: FC<Props> = ({ locations }) => {
  const [, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!window.confirm("削除して宜しいでしょうか")) return;
    startTransition(() => {
      void deleteLocationAction(id).then((result) => {
        if (!result.ok) alert(result.error);
      });
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead className={HEAD_NOWRAP}>順番</TableHead>
          <TableHead className={HEAD_NOWRAP}>保管場所</TableHead>
          <TableHead className={`w-full ${HEAD}`}>コメント</TableHead>
          <TableHead className={HEAD_NOWRAP}>編集</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations.map((location) => (
          <TableRow key={location.id}>
            <TableCell className="whitespace-nowrap">{location.order}</TableCell>
            <TableCell className="whitespace-nowrap">{location.name}</TableCell>
            <TableCell>
              <div className="flex gap-3 items-center">
                <CommentModal comment={location.comment} />
                {location.comment.slice(0, 10) + (location.comment.length > 10 ? "..." : "")}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-3">
                <EditLocationModal location={location} />
                <FaTrashAlt color="#444" cursor="pointer" onClick={() => handleDelete(location.id)} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
