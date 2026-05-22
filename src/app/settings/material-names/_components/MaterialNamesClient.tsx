"use client";

import { useState, FC } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addMaterialNameAction, deleteMaterialNameAction } from "@/app/settings/actions";

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
      <h1 className="text-2xl font-bold mb-4">組織名</h1>
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
                <FaTrashAlt color="#444" cursor="pointer" onClick={() => handleDelete(n)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
