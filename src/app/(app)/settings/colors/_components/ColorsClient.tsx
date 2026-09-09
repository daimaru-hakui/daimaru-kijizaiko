"use client";

import { useState, FC } from "react";
import { FaTrashAlt } from "react-icons/fa";
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
import { addColorAction, deleteColorAction, reorderColorsAction } from "@/app/(app)/settings/actions";

type Props = {
  initialColors: string[];
};

export const ColorsClient: FC<Props> = ({ initialColors }) => {
  const [colors, setColors] = useState(initialColors);
  const [color, setColor] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [enterIdx, setEnterIdx] = useState<number | null>(null);
  const [prevColors, setPrevColors] = useState<string[] | null>(null);

  const handleAdd = async () => {
    if (!color.trim()) return;
    const result = await addColorAction(color.trim());
    if (!result.ok) { alert(result.error); return; }
    setColors((prev) => [...prev, color.trim()]);
    setColor("");
  };

  const handleDelete = async (c: string) => {
    if (!window.confirm("削除して宜しいでしょうか")) return;
    const result = await deleteColorAction(c);
    if (!result.ok) { alert(result.error); return; }
    setColors((prev) => prev.filter((x) => x !== c));
  };

  const dragStart = (idx: number) => {
    setDragIdx(idx);
    setPrevColors([...colors]);
  };

  const dragEnter = (idx: number) => {
    setEnterIdx(idx);
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...colors];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setColors(next);
    setDragIdx(idx);
  };

  const dragEnd = async () => {
    const result = await reorderColorsAction(colors);
    if (!result.ok) {
      alert(result.error);
      if (prevColors) setColors(prevColors);
    }
    setDragIdx(null);
    setEnterIdx(null);
    setPrevColors(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">色</h1>
        <CsvDownloadButton
          filename="色一覧"
          build={() => buildNameListCsv("色", colors)}
        />
      </div>
      <div className="flex gap-3 mt-3">
        <Input
          autoFocus
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
        />
        <Button onClick={handleAdd}>追加</Button>
      </div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>色</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colors.map((c, idx) => (
            <TableRow
              key={c}
              draggable
              onDragStart={() => dragStart(idx)}
              onDragEnter={() => dragEnter(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={dragEnd}
              className={`cursor-pointer ${enterIdx === idx ? "border-t-2 border-blue-300" : ""}`}
            >
              <TableCell className="w-full">{c}</TableCell>
              <TableCell className="w-5">
                <FaTrashAlt color="#444" cursor="pointer" onClick={() => handleDelete(c)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
