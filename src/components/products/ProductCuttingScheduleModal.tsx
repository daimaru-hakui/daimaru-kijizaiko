"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCuttingScheduleTotal } from "@/lib/utils";
import { useUserRoles } from "@/components/app-shell/roles-context";
import { deleteScheduleAction } from "@/app/(app)/schedules/actions";
import { notifyResult, TOAST } from "@/components/ui/toast";
import type { CuttingSchedule } from "../../../types";

type Props = {
  scheduleIds: string[];
  schedulesMap: Record<string, CuttingSchedule>;
  usersMap: Record<string, string>;
};

export function ProductCuttingScheduleModal({
  scheduleIds,
  schedulesMap,
  usersMap,
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { tokushima } = useUserRoles();
  const total = getCuttingScheduleTotal(scheduleIds, schedulesMap);
  const schedules = scheduleIds.flatMap((id) =>
    schedulesMap[id] ? [schedulesMap[id]] : [],
  );

  const handleDelete = async (id: string, productId: string) => {
    if (!window.confirm("削除してもよいですか？")) return;
    const result = await deleteScheduleAction(id, productId);
    if (!notifyResult(result, TOAST.deleted)) return;
    router.refresh();
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-6 px-1.5 sm:px-2 text-[11px] sm:text-xs bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100"
        onClick={() => setOpen(true)}
      >
        {total.toLocaleString()}m
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>使用予定一覧</DialogTitle>
          </DialogHeader>
          <div className="text-right text-sm font-semibold text-slate-700 pr-1">
            合計 {total.toLocaleString()}m
          </div>
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-semibold text-slate-500">
                    担当
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">
                    加工指示書NO.
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">
                    アイテム名
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-500">
                    使用予定(m)
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">
                    製品納期
                  </TableHead>
                  {tokushima && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{usersMap[s.staff] ?? s.staff}</TableCell>
                    <TableCell>{s.processNumber}</TableCell>
                    <TableCell>{s.itemName}</TableCell>
                    <TableCell className="text-right">
                      {s.quantity.toLocaleString()}m
                    </TableCell>
                    <TableCell>{s.scheduledAt}</TableCell>
                    {tokushima && (
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(s.id, s.productId)}
                        >
                          削除
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
