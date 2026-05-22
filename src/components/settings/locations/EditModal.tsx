"use client";

import { useState, FC } from "react";
import { FaEdit } from "react-icons/fa";
import { Location } from "../../../../types";
import { LocationInputArea } from "./LocationInputArea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  location: Location;
};

export const EditLocationModal: FC<Props> = ({ location }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FaEdit color="#444" cursor="pointer" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編集</DialogTitle>
          </DialogHeader>
          <LocationInputArea
            type="edit"
            location={location}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
