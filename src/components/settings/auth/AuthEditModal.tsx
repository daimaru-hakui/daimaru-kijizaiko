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
import { updateUserProfileAction } from "@/app/settings/actions";

type Props = {
  uid: string;
  initialRank: number;
  initialName: string;
};

export const AuthEditModal: FC<Props> = ({ uid, initialRank, initialName }) => {
  const [open, setOpen] = useState(false);
  const [rank, setRank] = useState(initialRank);
  const [name, setName] = useState(initialName);

  const handleOpen = () => {
    setRank(initialRank);
    setName(initialName);
    setOpen(true);
  };

  const handleSave = async () => {
    const result = await updateUserProfileAction(uid, rank, name);
    if (!result.ok) { alert(result.error); return; }
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" onClick={handleOpen}>編集</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>名前編集</DialogTitle>
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
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => { setRank(initialRank); setName(initialName); setOpen(false); }}>
              キャンセル
            </Button>
            <Button className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSave}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
