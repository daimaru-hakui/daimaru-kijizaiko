"use client";

import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface NumberInputProps {
  id?: string;
  value?: number | string;
  defaultValue?: number | string;
  min?: number;
  max?: number;
  /** +/- ボタンの増減幅。入力欄そのものは小数を受け付ける (step="any") */
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

function clampValue(
  value: number,
  min: number | undefined,
  max: number | undefined
): number {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
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
  const [internalValue, setInternalValue] = React.useState<string>(
    String(defaultValue ?? "")
  );

  const displayValue = controlled ? String(value) : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (!controlled) setInternalValue(newVal);
    onChange?.(newVal, parseFloat(newVal));
  };

  const increment = () => {
    const current = parseFloat(displayValue) || 0;
    const next = roundValue(clampValue(current + step, min, max));
    const nextStr = String(next);
    if (!controlled) setInternalValue(nextStr);
    onChange?.(nextStr, next);
  };

  const decrement = () => {
    const current = parseFloat(displayValue) || 0;
    const next = roundValue(clampValue(current - step, min, max));
    const nextStr = String(next);
    if (!controlled) setInternalValue(nextStr);
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
        onClick={decrement}
        disabled={disabled}
        className="h-8 w-8 shrink-0"
      >
        -
      </Button>
      <Input
        id={id}
        type="number"
        role="spinbutton"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        min={min}
        max={max}
        // 生地の長さは m 単位で小数を扱うため、ブラウザの step 検証は無効にする
        step="any"
        // 増減は +/- ボタンで行うため、ブラウザ標準のスピナーは隠す
        className={cn(
          "text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          inputClassName
        )}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="+"
        onClick={increment}
        disabled={disabled}
        className="h-8 w-8 shrink-0"
      >
        +
      </Button>
    </div>
  );
}
