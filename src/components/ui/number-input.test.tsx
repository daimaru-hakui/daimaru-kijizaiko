import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "./number-input";

describe("NumberInput", () => {
  it("クラッシュせずにレンダリングできる", () => {
    const onChange = vi.fn();
    render(<NumberInput value="5" onChange={onChange} />);
  });

  it("input 要素が存在する", () => {
    render(<NumberInput value="5" onChange={vi.fn()} />);
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("増加ボタン (+) が存在する", () => {
    render(<NumberInput value="5" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "+" })).toBeInTheDocument();
  });

  it("減少ボタン (-) が存在する", () => {
    render(<NumberInput value="5" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "-" })).toBeInTheDocument();
  });

  it("onChange が入力変更時に (文字列, 数値) を渡す（Chakra 互換シグネチャ）", async () => {
    const onChange = vi.fn();
    render(<NumberInput value="" onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "3");
    expect(onChange).toHaveBeenCalledWith("3", 3);
  });

  it("+ ボタンをクリックすると onChange に増加後の (文字列, 数値) を渡す", async () => {
    const onChange = vi.fn();
    render(<NumberInput value="5" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "+" }));
    expect(onChange).toHaveBeenCalledWith("6", 6);
  });

  it("- ボタンをクリックすると onChange に減少後の (文字列, 数値) を渡す", async () => {
    const onChange = vi.fn();
    render(<NumberInput value="5" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "-" }));
    expect(onChange).toHaveBeenCalledWith("4", 4);
  });

  it("min が input に渡される", () => {
    render(<NumberInput value="5" onChange={vi.fn()} min={0} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("min", "0");
  });

  it("max が input に渡される", () => {
    render(<NumberInput value="5" onChange={vi.fn()} max={100} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("max", "100");
  });

  it("min を下回る値にクランプされる", async () => {
    const onChange = vi.fn();
    render(<NumberInput value="0" onChange={onChange} min={0} />);
    await userEvent.click(screen.getByRole("button", { name: "-" }));
    expect(onChange).toHaveBeenCalledWith("0", 0);
  });

  it("max を上回る値にクランプされる", async () => {
    const onChange = vi.fn();
    render(<NumberInput value="100" onChange={onChange} max={100} />);
    await userEvent.click(screen.getByRole("button", { name: "+" }));
    expect(onChange).toHaveBeenCalledWith("100", 100);
  });
});
