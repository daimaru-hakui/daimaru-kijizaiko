"use client";

import { useState, useEffect, FC } from "react";
import { FaRegCommentDots } from "react-icons/fa";
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
  const [newComment, setNewComment] = useState(comment);

  useEffect(() => {
    setNewComment(comment);
  }, [comment]);

  return (
    <>
      {comment && (
        <FaRegCommentDots
          opacity={comment === "" ? "0.2" : "1"}
          cursor="pointer"
          fontSize="20px"
          onClick={() => setOpen(true)}
        />
      )}

      <Dialog open={open} onOpenChange={(v) => { if (!v) setNewComment(comment); setOpen(v); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コメント</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap">{newComment}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewComment(comment); setOpen(false); }}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
