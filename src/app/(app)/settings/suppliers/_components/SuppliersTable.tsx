"use client";

import { FC, useTransition } from "react";
import { Supplier } from "../../../../../../types";
import { deleteSupplierAction } from "@/app/(app)/settings/actions";
import { CommentModal } from "@/components/CommentModal";
import { EditModal } from "@/components/settings/suppliers/EditModal";
import { CsvDownloadButton } from "@/components/list/CsvDownloadButton";
import { buildSupplierCsv } from "@/lib/settings/csv";
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
// 名前・カナは途中で折り返すと読みにくいので折り返さない
const HEAD_NOWRAP = `${HEAD} whitespace-nowrap`;

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
    <>
      <div className="flex justify-end mb-3">
        <CsvDownloadButton
          filename="仕入先一覧"
          build={() => buildSupplierCsv(suppliers)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className={HEAD_NOWRAP}>仕入先名</TableHead>
            <TableHead className={HEAD_NOWRAP}>フリガナ</TableHead>
            <TableHead className={`w-full ${HEAD}`}>コメント</TableHead>
            <TableHead className={HEAD_NOWRAP}>編集</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="whitespace-nowrap">{supplier.name}</TableCell>
              <TableCell className="whitespace-nowrap">{supplier.kana}</TableCell>
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
    </>
  );
};
