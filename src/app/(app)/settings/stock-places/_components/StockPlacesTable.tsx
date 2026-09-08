"use client";

import { FC, useTransition } from "react";
import { StockPlace } from "../../../../../../types";
import { deleteStockPlaceAction } from "@/app/(app)/settings/actions";
import { CommentModal } from "@/components/CommentModal";
import { EditModal } from "@/components/settings/stock-places/EditModal";
import { FaTrashAlt } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PROTECTED_ID = "ifk1EZX80Jecxy04fqxu";

type Props = {
  stockPlaces: StockPlace[];
};

export const StockPlacesTable: FC<Props> = ({ stockPlaces }) => {
  const [, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!window.confirm("削除して宜しいでしょうか")) return;
    startTransition(() => {
      void deleteStockPlaceAction(id).then((result) => {
        if (!result.ok) alert(result.error);
      });
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">送り先名</TableHead>
          <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">フリガナ</TableHead>
          <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">住所</TableHead>
          <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">TEL</TableHead>
          <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">FAX</TableHead>
          <TableHead className="w-full text-xs font-semibold text-slate-500 tracking-wider">コメント</TableHead>
          <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">編集/削除</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockPlaces.map((sp) => (
          <TableRow key={sp.id}>
            <TableCell>{sp.name}</TableCell>
            <TableCell>{sp.kana}</TableCell>
            <TableCell>{sp.address}</TableCell>
            <TableCell>{sp.tel}</TableCell>
            <TableCell>{sp.fax}</TableCell>
            <TableCell>
              <div className="flex gap-3 items-center">
                <CommentModal comment={sp.comment} />
                {sp.comment.slice(0, 10) + (sp.comment.length > 10 ? "..." : "")}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-3">
                <EditModal stockPlace={sp} />
                {sp.id !== PROTECTED_ID && (
                  <FaTrashAlt color="#444" cursor="pointer" onClick={() => handleDelete(sp.id)} />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
