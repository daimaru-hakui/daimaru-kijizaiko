"use client";

import { useState, FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    const profileResult = await updateUserProfileAction(uid, rank, name);
    // メールは Firebase Auth 側の更新になるので、変えたときだけ呼ぶ
    const result =
      profileResult.ok && email.trim() !== initialEmail
        ? await updateUserEmailAction(uid, email)
        : profileResult;
    if (!notifyResult(result, TOAST.updated)) return;
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" onClick={handleOpen}>編集</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <p className="text-sm mb-1">id</p>
              <NumberInput
                value={rank}
                min={0}
                max={999}
                onChange={(_str, num) => setRank(isNaN(num) ? rank : num)}
              />
            </div>
            <div>
              <p className="text-sm mb-1">名前</p>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor={`email-${uid}`} className="block text-sm mb-1">メールアドレス</label>
              <Input
                id={`email-${uid}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">ログインに使うメールアドレスが変わります</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => { setRank(initialRank); setName(initialName); setEmail(initialEmail); setOpen(false); }}>
              キャンセル
            </Button>
            <Button className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSave}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
