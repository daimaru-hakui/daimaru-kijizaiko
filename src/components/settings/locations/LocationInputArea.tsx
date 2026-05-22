"use client";

import { useState, useEffect, FC } from "react";
import { useRouter } from "next/navigation";
import { Location } from "../../../../types";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { addLocationAction, updateLocationAction } from "@/app/settings/actions";

type Props = {
  type: "new" | "edit";
  location: Location;
  onSuccess?: () => void;
};

type Inputs = Omit<Location, "id">;

export const LocationInputArea: FC<Props> = ({ type, location, onSuccess }) => {
  const router = useRouter();
  const [flag, setFlag] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Inputs>({
    defaultValues: { name: location.name, order: location.order, comment: location.comment },
  });

  const nameValue = watch("name");
  useEffect(() => { setFlag(false); }, [nameValue]);

  const handleFormSubmit: SubmitHandler<Inputs> = async (data) => {
    if (type === "new") {
      const result = window.confirm("登録して宜しいでしょうか");
      if (!result) return;
      const addResult = await addLocationAction(data);
      if (!addResult.ok) { alert(addResult.error); return; }
      router.push("/settings/locations");
    } else {
      const result = window.confirm("変更して宜しいでしょうか");
      if (!result) return;
      const updateResult = await updateLocationAction(location.id, data);
      if (!updateResult.ok) { alert(updateResult.error); return; }
      router.refresh();
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="flex flex-col gap-6 mt-6">
        <div>
          <p className="text-sm mb-1">保管場所名</p>
          <Input {...register("name", { required: true })} />
          {errors.name && <p className="text-red-600 font-bold text-sm mt-1">※保管場所を入力してください</p>}
          {flag && <p className="text-red-600 font-bold text-sm mt-1">※すでに登録されています。</p>}
        </div>
        <div>
          <p className="text-sm mb-1">順番</p>
          <NumberInput
            value={watch("order")}
            min={0}
            max={1000}
            onChange={(_str, num) => setValue("order", isNaN(num) ? 0 : num)}
          />
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
