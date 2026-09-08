import * as React from "react";
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

  it("小数を入力できる（生地の長さは m 単位で小数を扱う）", async () => {
    const onChange = vi.fn();
    render(<NumberInput defaultValue="" onChange={onChange} />);

    await userEvent.type(screen.getByRole("spinbutton"), "2.7");

    expect(onChange).toHaveBeenLastCalledWith("2.7", 2.7);
  });

  it("小数値に + ボタンを押しても浮動小数の誤差が出ない", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberInput value={2.7} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "+" }));

    expect(onChange).toHaveBeenCalledWith("3.7", 3.7);
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

describe("NumberInput のスピナー", () => {
  it("増減は +/- ボタンで行うため、ブラウザ標準の矢印は出さない", () => {
    render(<NumberInput value="5" onChange={vi.fn()} />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "text");
  });
});

describe("NumberInput の小数入力 (制御コンポーネントとして数値 state に繋いだ場合)", () => {
  /** 呼び出し側 (発注数量・入荷数量など約30箇所) と同じ繋ぎ方 */
  function ControlledConsumer({ initial = 0 }: { initial?: number }) {
    const [quantity, setQuantity] = React.useState(initial);
    return (
      <>
        <NumberInput value={quantity} onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)} />
        <output data-testid="quantity">{String(quantity)}</output>
      </>
    );
  }

  it("ブラウザが入力途中の値を消さないよう type=number を使わない", () => {
    render(<NumberInput value="2.7" onChange={vi.fn()} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("inputmode", "decimal");
  });

  it("0.5 のように小数点から入力できる", async () => {
    const user = userEvent.setup();
    render(<ControlledConsumer />);
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await user.type(input, ".5");

    expect(screen.getByTestId("quantity")).toHaveTextContent("0.5");
  });

  it("小数点を打った直後も入力欄から消えない", async () => {
    const user = userEvent.setup();
    render(<ControlledConsumer />);
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await user.type(input, "2.");

    expect(input).toHaveValue("2.");
  });

  it("入力欄を空にしたとき 0 に戻さない", async () => {
    const user = userEvent.setup();
    render(<ControlledConsumer initial={12} />);
    const input = screen.getByRole("spinbutton");

    await user.clear(input);

    expect(input).toHaveValue("");
  });

  it("数字・小数点・マイナス以外は入力できない", async () => {
    const user = userEvent.setup();
    render(<ControlledConsumer />);
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await user.type(input, "1a2");

    expect(input).toHaveValue("12");
  });

  it("親が値を入れ替えたときは入力欄に反映する", async () => {
    function Resettable() {
      const [quantity, setQuantity] = React.useState(2.7);
      return (
        <>
          <NumberInput value={quantity} onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)} />
          <button type="button" onClick={() => setQuantity(100)}>
            リセット
          </button>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Resettable />);

    await user.click(screen.getByRole("button", { name: "リセット" }));

    expect(screen.getByRole("spinbutton")).toHaveValue("100");
  });
});
