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

const HEAD = "text-xs font-semibold text-slate-500 tracking-wider";
// 名前・カナ・電話番号は途中で折り返すと読みにくいので折り返さない
const HEAD_NOWRAP = `${HEAD} whitespace-nowrap`;

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
          <TableHead className={HEAD_NOWRAP}>送り先名</TableHead>
          <TableHead className={HEAD_NOWRAP}>フリガナ</TableHead>
          <TableHead className={HEAD}>住所</TableHead>
          <TableHead className={HEAD_NOWRAP}>TEL</TableHead>
          <TableHead className={HEAD_NOWRAP}>FAX</TableHead>
          <TableHead className={`w-full ${HEAD}`}>コメント</TableHead>
          <TableHead className={HEAD_NOWRAP}>編集/削除</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockPlaces.map((sp) => (
          <TableRow key={sp.id}>
            <TableCell className="whitespace-nowrap">{sp.name}</TableCell>
            <TableCell className="whitespace-nowrap">{sp.kana}</TableCell>
            <TableCell>{sp.address}</TableCell>
            <TableCell className="whitespace-nowrap">{sp.tel}</TableCell>
            <TableCell className="whitespace-nowrap">{sp.fax}</TableCell>
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
