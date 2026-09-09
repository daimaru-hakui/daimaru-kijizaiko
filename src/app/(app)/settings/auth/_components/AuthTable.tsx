"use client";

import { FC, useTransition } from "react";
import { User } from "../../../../../../types";
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
import { Button } from "@/components/ui/button";

type Props = {
  users: User[];
};

export const AuthTable: FC<Props> = ({ users }) => {
  const [, startTransition] = useTransition();

  const toggle = (uid: string, prop: string, current: boolean) => {
    startTransition(() => {
      void toggleUserAuthAction(uid, prop, current).then((result) => {
        if (!result.ok) alert(result.error);
      });
    });
  };

  const authButton = (user: User, prop: keyof User) => (
    <Button
      size="sm"
      variant={user[prop] ? "default" : "outline"}
      onClick={() => toggle(user.uid, prop, !!user[prop])}
    >
      {user[prop] ? "有効" : "無効"}
    </Button>
  );

  return (
    <>
      <div className="flex justify-end mb-3">
        <CsvDownloadButton
          filename="権限管理"
          build={() => buildUserAuthCsv(users)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">ID</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">名前</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">管理者</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">R&D</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">営業</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">経理</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">徳島工場</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">編集</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>{user.rank}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{authButton(user, "admin")}</TableCell>
              <TableCell>{authButton(user, "rd")}</TableCell>
              <TableCell>{authButton(user, "sales")}</TableCell>
              <TableCell>{authButton(user, "accounting")}</TableCell>
              <TableCell>{authButton(user, "tokushima")}</TableCell>
              <TableCell>
                <AuthEditModal uid={user.uid} initialRank={user.rank} initialName={user.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
