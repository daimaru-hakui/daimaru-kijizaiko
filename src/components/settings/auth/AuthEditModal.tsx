"use client";

import { useState, FC } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { updateUserEmailAction, updateUserProfileAction } from "@/app/(app)/settings/actions";
import { notifyResult, TOAST } from "@/components/ui/toast";

type Props = {
  uid: string;
  initialRank: number;
  initialName: string;
  initialEmail: string;
};

export const AuthEditModal: FC<Props> = ({ uid, initialRank, initialName, initialEmail }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rank, setRank] = useState(initialRank);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  const handleOpen = () => {
    setRank(initialRank);
    setName(initialName);
    setEmail(initialEmail);
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileResult = await updateUserProfileAction(uid, rank, name);
      // メールは Firebase Auth 側の更新になるので、変えたときだけ呼ぶ
      const result =
        profileResult.ok && email.trim() !== initialEmail
          ? await updateUserEmailAction(uid, email)
          : profileResult;
      if (!notifyResult(result, TOAST.updated)) return;
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const ids = { rank: `rank-${uid}`, name: `name-${uid}`, email: `email-${uid}` };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 gap-1.5 px-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        onClick={handleOpen}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        編集
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
            <DialogDescription>表示順の ID・名前・ログイン用メールアドレスを変更します。</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-5 py-1">
            <div className="space-y-2">
              <Label htmlFor={ids.rank} className="text-slate-700">ID</Label>
              <NumberInput
                id={ids.rank}
                value={rank}
                min={0}
                max={999}
                onChange={(_str, num) => setRank(isNaN(num) ? rank : num)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={ids.name} className="text-slate-700">名前</Label>
              <Input id={ids.name} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor={ids.email} className="text-slate-700">メールアドレス</Label>
              <Input
                id={ids.email}
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs leading-relaxed text-slate-500">
                変更すると、本人は次回から新しいメールアドレスでログインします。
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              className="border-slate-200 text-slate-600"
              onClick={() => setOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              className="min-w-24 bg-blue-800 hover:bg-blue-900 text-white"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "保存中…" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
