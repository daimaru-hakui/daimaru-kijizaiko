"use client";

import { useState, useEffect, FC } from "react";
import { useRouter } from "next/navigation";
import { Supplier } from "../../../../types";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addSupplierAction, updateSupplierAction } from "@/app/settings/actions";

type Props = {
  type: "new" | "edit";
  supplier: Supplier;
  onSuccess?: () => void;
};

type Inputs = Pick<Supplier, "name" | "kana" | "comment">;

export const SupplierInputArea: FC<Props> = ({ type, supplier, onSuccess }) => {
  const router = useRouter();
  const [flag, setFlag] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>({
    defaultValues: { name: supplier.name, kana: supplier.kana, comment: supplier.comment },
  });

  const nameValue = watch("name");
  useEffect(() => { setFlag(false); }, [nameValue]);

  const handleFormSubmit: SubmitHandler<Inputs> = async (data) => {
    if (type === "new") {
      const result = window.confirm("登録して宜しいでしょうか");
      if (!result) return;
      const addResult = await addSupplierAction(data);
      if (!addResult.ok) { alert(addResult.error); return; }
      router.push("/settings/suppliers");
    } else {
      const result = window.confirm("変更して宜しいでしょうか");
      if (!result) return;
      const updateResult = await updateSupplierAction(supplier.id, data);
      if (!updateResult.ok) { alert(updateResult.error); return; }
      router.refresh();
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="flex flex-col gap-6 mt-6">
        <div>
          <p className="text-sm mb-1">仕入先名</p>
          <Input {...register("name", { required: true })} />
          {errors.name && <p className="text-red-600 font-bold text-sm mt-1">※仕入れ先を入力してください</p>}
          {flag && <p className="text-red-600 font-bold text-sm mt-1">※すでに登録されています。</p>}
        </div>
        <div>
          <p className="text-sm mb-1">フリガナ</p>
          <Input {...register("kana")} />
        </div>
        <div>
          <p className="text-sm mb-1">備考</p>
          <Textarea {...register("comment")} />
        </div>
        <Button type="submit" disabled={flag} className="bg-blue-800 hover:bg-blue-900 text-white">{type === "new" ? "登録" : "更新"}</Button>
      </div>
    </form>
  );
};
