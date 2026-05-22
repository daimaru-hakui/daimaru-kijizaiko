"use client";

import { FC, useTransition } from "react";
import { Supplier } from "../../../../../types";
import { deleteSupplierAction } from "@/app/settings/actions";
import { CommentModal } from "@/components/CommentModal";
import { EditModal } from "@/components/settings/suppliers/EditModal";
import { FaTrashAlt } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  suppliers: Supplier[];
};

export const SuppliersTable: FC<Props> = ({ suppliers }) => {
  const [, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!window.confirm("削除して宜しいでしょうか")) return;
    startTransition(() => {
      void deleteSupplierAction(id).then((result) => {
        if (!result.ok) alert(result.error);
      });
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">仕入先名</TableHead>
          <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">フリガナ</TableHead>
          <TableHead className="w-full text-xs font-semibold text-slate-500 tracking-wider">コメント</TableHead>
          <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">編集</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell>{supplier.name}</TableCell>
            <TableCell>{supplier.kana}</TableCell>
            <TableCell>
              <div className="flex gap-3 items-center">
                <CommentModal comment={supplier.comment} />
                {supplier.comment.slice(0, 10) + (supplier.comment.length > 10 ? "..." : "")}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-3">
                <EditModal supplier={supplier} />
                <FaTrashAlt color="#444" cursor="pointer" onClick={() => handleDelete(supplier.id)} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
