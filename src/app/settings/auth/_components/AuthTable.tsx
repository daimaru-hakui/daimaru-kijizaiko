"use client";

import { FC, useTransition } from "react";
import { User } from "../../../../../types";
import { toggleUserAuthAction } from "@/app/settings/actions";
import { AuthEditModal } from "@/components/settings/auth/AuthEditModal";
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>名前</TableHead>
          <TableHead>R&D</TableHead>
          <TableHead>営業</TableHead>
          <TableHead>経理</TableHead>
          <TableHead>徳島工場</TableHead>
          <TableHead>編集</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.uid}>
            <TableCell>{user.rank}</TableCell>
            <TableCell>{user.name}</TableCell>
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
  );
};
