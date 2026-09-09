"use client";

import { useState, FC } from "react";
import { MessageSquareText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  comment: string;
};

export const CommentModal: FC<Props> = ({ comment }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {comment && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700"
          aria-label="コメントを表示"
          onClick={() => setOpen(true)}
        >
          <MessageSquareText className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コメント</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap">{comment}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
