"use client";

import { FC, useTransition } from "react";
import { User } from "../../../../../../types";
import type { AuthUser } from "@/lib/settings/queries";
import { toggleUserAuthAction } from "@/app/(app)/settings/actions";
import { AuthEditModal } from "@/components/settings/auth/AuthEditModal";
import { CsvDownloadButton } from "@/components/list/CsvDownloadButton";
import { buildUserAuthCsv } from "@/lib/settings/csv";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HEAD } from "@/components/ui/table-styles";
import { notifyError } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Props = {
  users: AuthUser[];
};

const ROLE_COLUMNS = [
  { prop: "admin", label: "管理者" },
  { prop: "rd", label: "R&D" },
  { prop: "sales", label: "営業" },
  { prop: "accounting", label: "経理" },
  { prop: "tokushima", label: "徳島工場" },
] as const satisfies readonly { prop: keyof User; label: string }[];

export const AuthTable: FC<Props> = ({ users }) => {
  const [, startTransition] = useTransition();

  const toggle = (uid: string, prop: string, current: boolean) => {
    startTransition(() => {
      void toggleUserAuthAction(uid, prop, current).then((result) => {
        if (!result.ok) notifyError(result.error);
      });
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">権限管理</h2>
          <p className="mt-1 text-sm text-slate-500">
            ユーザーごとの権限とログイン用メールアドレスを管理します
            <span className="ml-2 tabular-nums text-slate-400">{users.length} 名</span>
          </p>
        </div>
        <CsvDownloadButton filename="権限管理" build={() => buildUserAuthCsv(users)} />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className={cn(HEAD, "w-14")}>ID</TableHead>
            <TableHead className={HEAD}>名前</TableHead>
            <TableHead className={HEAD}>メールアドレス</TableHead>
            {ROLE_COLUMNS.map((col) => (
              <TableHead key={col.prop} className={cn(HEAD, "w-20")}>
                {col.label}
              </TableHead>
            ))}
            <TableHead className={cn(HEAD, "w-20")}>
              <span className="sr-only">編集</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell className="tabular-nums text-slate-500">{user.rank}</TableCell>
              <TableCell className="font-medium text-slate-900 whitespace-nowrap">{user.name}</TableCell>
              <TableCell className="max-w-64 truncate text-slate-600" title={user.email}>
                {user.email || <span className="text-slate-300">未登録</span>}
              </TableCell>
              {ROLE_COLUMNS.map((col) => {
                const enabled = user[col.prop];
                return (
                  <TableCell key={col.prop}>
                    <button
                      type="button"
                      aria-pressed={enabled}
                      aria-label={`${user.name} の${col.label}権限`}
                      onClick={() => toggle(user.uid, col.prop, enabled)}
                      className={cn(
                        "inline-flex h-7 min-w-14 items-center justify-center rounded-full border px-3 text-xs font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800/40",
                        enabled
                          ? "border-blue-800 bg-blue-800 text-white hover:bg-blue-900"
                          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600",
                      )}
                    >
                      {enabled ? "有効" : "無効"}
                    </button>
                  </TableCell>
                );
              })}
              <TableCell className="text-right">
                <AuthEditModal
                  uid={user.uid}
                  initialRank={user.rank}
                  initialName={user.name}
                  initialEmail={user.email}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
