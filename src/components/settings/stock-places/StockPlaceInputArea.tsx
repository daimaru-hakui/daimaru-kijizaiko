"use client";

import { useState, useEffect, FC } from "react";
import { useRouter } from "next/navigation";
import { StockPlace } from "../../../../types";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addStockPlaceAction, updateStockPlaceAction } from "@/app/settings/actions";

type Props = {
  type: "new" | "edit";
  stockPlace: StockPlace;
  onSuccess?: () => void;
};

type Inputs = Omit<StockPlace, "id">;

export const StockPlaceInputArea: FC<Props> = ({ type, stockPlace, onSuccess }) => {
  const router = useRouter();
  const [flag, setFlag] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      name: stockPlace.name, kana: stockPlace.kana,
      address: stockPlace.address, tel: stockPlace.tel,
      fax: stockPlace.fax, comment: stockPlace.comment,
    },
  });

  const nameValue = watch("name");
  useEffect(() => { setFlag(false); }, [nameValue]);

  const handleFormSubmit: SubmitHandler<Inputs> = async (data) => {
    if (type === "new") {
      const result = window.confirm("登録して宜しいでしょうか");
      if (!result) return;
      const addResult = await addStockPlaceAction(data);
      if (!addResult.ok) { alert(addResult.error); return; }
      router.push("/settings/stock-places");
    } else {
      const result = window.confirm("変更して宜しいでしょうか");
      if (!result) return;
      const updateResult = await updateStockPlaceAction(stockPlace.id, data);
      if (!updateResult.ok) { alert(updateResult.error); return; }
      router.refresh();
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="flex flex-col gap-6 mt-6">
        <div>
          <p className="text-sm mb-1">送り先名</p>
          <Input {...register("name", { required: true })} />
          {errors.name && <p className="text-red-600 font-bold text-sm mt-1">※送り先を入力してください</p>}
          {flag && <p className="text-red-600 font-bold text-sm mt-1">※すでに登録されています。</p>}
        </div>
        <div>
          <p className="text-sm mb-1">フリガナ</p>
          <Input {...register("kana")} />
        </div>
        <div>
          <p className="text-sm mb-1">住所</p>
          <Input {...register("address")} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-sm mb-1">TEL</p>
            <Input {...register("tel")} />
          </div>
          <div className="flex-1">
            <p className="text-sm mb-1">FAX</p>
            <Input {...register("fax")} />
          </div>
        </div>
        <div>
          <p className="text-sm mb-1">備考</p>
          <Textarea {...register("comment")} />
        </div>
        <Button type="submit" disabled={flag}>{type === "new" ? "登録" : "更新"}</Button>
      </div>
    </form>
  );
};
