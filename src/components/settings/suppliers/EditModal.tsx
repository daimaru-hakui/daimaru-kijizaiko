"use client";

import { useState, FC } from "react";
import { FaEdit } from "react-icons/fa";
import { Supplier } from "../../../../types";
import { SupplierInputArea } from "./SupplierInputArea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  supplier: Supplier;
};

export const EditModal: FC<Props> = ({ supplier }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FaEdit color="#444" cursor="pointer" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編集</DialogTitle>
          </DialogHeader>
          <SupplierInputArea
            type="edit"
            supplier={supplier}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
