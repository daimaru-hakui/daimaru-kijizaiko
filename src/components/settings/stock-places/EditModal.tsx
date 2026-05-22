"use client";

import { useState, FC } from "react";
import { FaEdit } from "react-icons/fa";
import { StockPlace } from "../../../../types";
import { StockPlaceInputArea } from "./StockPlaceInputArea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  stockPlace: StockPlace;
};

export const EditModal: FC<Props> = ({ stockPlace }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FaEdit color="#444" cursor="pointer" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編集</DialogTitle>
          </DialogHeader>
          <StockPlaceInputArea
            type="edit"
            stockPlace={stockPlace}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
