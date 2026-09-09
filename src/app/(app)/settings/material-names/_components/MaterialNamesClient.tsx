"use client";

import { useState, FC } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CsvDownloadButton } from "@/components/list/CsvDownloadButton";
import { buildNameListCsv } from "@/lib/settings/csv";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addMaterialNameAction, deleteMaterialNameAction } from "@/app/(app)/settings/actions";

type Props = {
  initialNames: string[];
};

export const MaterialNamesClient: FC<Props> = ({ initialNames }) => {
  const [names, setNames] = useState([...initialNames].sort());
  const [name, setName] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    const result = await addMaterialNameAction(name.trim());
    if (!result.ok) { alert(result.error); return; }
    setNames((prev) => [...prev, name.trim()].sort());
    setName("");
  };

  const handleDelete = async (n: string) => {
    if (!window.confirm("削除して宜しいでしょうか")) return;
    const result = await deleteMaterialNameAction(n);
    if (!result.ok) { alert(result.error); return; }
    setNames((prev) => prev.filter((x) => x !== n));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">組織名</h1>
        <CsvDownloadButton
          filename="組織名一覧"
          build={() => buildNameListCsv("組織名", names)}
        />
      </div>
      <div className="flex gap-3 mt-3">
        <Input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
        />
        <Button onClick={handleAdd}>追加</Button>
      </div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>組織名</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {names.map((n) => (
            <TableRow key={n}>
              <TableCell className="w-full">{n}</TableCell>
              <TableCell className="w-5">
                <Trash2
                  color="#444"
                  className="h-3.5 w-3.5 cursor-pointer"
                  onClick={() => handleDelete(n)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
