"use client";

import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { isNumericDraft } from "@/lib/numbers";

export interface NumberInputProps {
  id?: string;
  value?: number | string;
  defaultValue?: number | string;
  min?: number;
  max?: number;
  /** +/- ボタンの増減幅。入力欄そのものは小数を受け付ける */
  step?: number;
  /** Chakra UI NumberInput 互換: 第2引数は valueAsNumber (NaN の場合あり) */
  onChange?: (valueAsString: string, valueAsNumber: number) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  width?: string;
}

/** 浮動小数の誤差 (0.1 + 0.2 = 0.30000000000000004) を丸める */
function roundValue(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function toNumber(value: number | string | undefined): number {
  return typeof value === "number" ? value : parseFloat(String(value ?? ""));
}

/**
 * 入力中の文字列を外部の値で上書きしてよいかを判定する。
 * 呼び出し側は数値 state を持つため、"2." は 2、"" は 0 として返ってくる。
 * そのまま String(value) を表示すると小数点や消したはずの値が復活するので、
 * 入力中の文字列が外部の値と矛盾しない限りは入力中の文字列を優先する。
 */
function keepsDraft(draft: string, value: number | string | undefined): boolean {
  const draftNum = parseFloat(draft);
  const valueNum = toNumber(value);
  // "" や "." など数値になりきっていない入力途中
  if (Number.isNaN(draftNum)) return Number.isNaN(valueNum) || valueNum === 0;
  return draftNum === valueNum;
}

export function NumberInput({
  id,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  className,
  inputClassName,
  width,
}: NumberInputProps) {
  const controlled = value !== undefined;
  const [draft, setDraft] = React.useState<string>(
    String(defaultValue ?? value ?? "")
  );

  const displayValue =
    controlled && !keepsDraft(draft, value) ? String(value) : draft;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    // 数値として読めない文字は打てないようにする (type="number" の代わり)
    if (!isNumericDraft(newVal)) return;
    setDraft(newVal);
    onChange?.(newVal, parseFloat(newVal));
  };

  const stepBy = (diff: number) => {
    const current = parseFloat(displayValue) || 0;
    let next = current + diff;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    next = roundValue(next);
    const nextStr = String(next);
    setDraft(nextStr);
    onChange?.(nextStr, next);
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      style={width ? { width } : undefined}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="-"
        onClick={() => stepBy(-step)}
        disabled={disabled}
        className="h-8 w-8 shrink-0"
      >
        -
      </Button>
      <Input
        id={id}
        // 生地の長さは m 単位で小数を扱う。type="number" はブラウザが "2." を
        // 空文字に正規化してしまい小数点が打てないため、text + inputMode で扱う
        type="text"
        inputMode="decimal"
        role="spinbutton"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        min={min}
        max={max}
        className={cn("text-center", inputClassName)}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="+"
        onClick={() => stepBy(step)}
        disabled={disabled}
        className="h-8 w-8 shrink-0"
      >
        +
      </Button>
    </div>
  );
}
