import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ListCard, ListCardPane } from "./ListCard";

/**
 * 一覧カードはスマホ幅で各ペインを縦に積み、md 以上で横並びのペイングリッドになる。
 * 見た目の規約なので class を直接検証する (app-shell のテストと同じ方針)。
 */
describe("ListCard", () => {
  it("md 以上のカラム定義をペイングリッドに載せる", () => {
    render(
      <ListCard mdCols="md:grid-cols-[2fr_1.5fr_7rem]">
        <ListCardPane>本文</ListCardPane>
      </ListCard>,
    );
    const grid = screen.getByText("本文").parentElement!;
    expect(grid.className).toContain("md:grid-cols-[2fr_1.5fr_7rem]");
    // md 未満は「本文=1fr / アクション=auto」の 2 列
    expect(grid.className).toContain("grid-cols-[minmax(0,1fr)_auto]");
  });

  it("danger のとき枠と左アクセント線が赤くなる", () => {
    const { container } = render(
      <ListCard mdCols="md:grid-cols-[1fr]" danger>
        <ListCardPane>本文</ListCardPane>
      </ListCard>,
    );
    const card = container.firstElementChild!;
    expect(card.className).toContain("border-red-300");
    expect(card.firstElementChild!.className).toContain("bg-red-400");
  });

  it("danger でないとき左アクセント線は indigo になる", () => {
    const { container } = render(
      <ListCard mdCols="md:grid-cols-[1fr]">
        <ListCardPane>本文</ListCardPane>
      </ListCard>,
    );
    const card = container.firstElementChild!;
    expect(card.className).toContain("border-slate-200");
    expect(card.firstElementChild!.className).toContain("bg-indigo-600");
  });
});

describe("ListCardPane", () => {
  it("既定のペインは md 未満で全幅・md 以上で 1 列になる", () => {
    render(
      <ListCard mdCols="md:grid-cols-[1fr_1fr]">
        <ListCardPane>品番</ListCardPane>
        <ListCardPane>担当</ListCardPane>
      </ListCard>,
    );
    const pane = screen.getByText("品番");
    expect(pane.className).toContain("col-span-2");
    expect(pane.className).toContain("md:col-auto");
  });

  it("既定のペインは md 未満で下線・md 以上で右線を持つ", () => {
    render(
      <ListCard mdCols="md:grid-cols-[1fr_1fr]">
        <ListCardPane>品番</ListCardPane>
        <ListCardPane>担当</ListCardPane>
      </ListCard>,
    );
    const pane = screen.getByText("品番");
    expect(pane.className).toContain("border-b");
    expect(pane.className).toContain("md:border-b-0");
    expect(pane.className).toContain("md:border-r");
  });

  it("末尾のペインは下線も右線も出さない", () => {
    render(
      <ListCard mdCols="md:grid-cols-[1fr_1fr]">
        <ListCardPane>品番</ListCardPane>
        <ListCardPane>担当</ListCardPane>
      </ListCard>,
    );
    // アクションを持たない一覧でカード末尾に余分な線が残らないようにする
    const pane = screen.getByText("担当");
    expect(pane.className).toContain("last:border-b-0");
    expect(pane.className).toContain("md:last:border-r-0");
  });

  it("stat ペインは列間に隙間を持つ", () => {
    render(
      <ListCard mdCols="md:grid-cols-[1fr]">
        <ListCardPane stat className="grid-cols-3">
          数値
        </ListCardPane>
      </ListCard>,
    );
    // 隙間が無いと幅を超えたバッジが隣の値に重なる
    const pane = screen.getByText("数値");
    expect(pane.className).toContain("gap-x-1.5");
    expect(pane.className).toContain("bg-slate-50/60");
    expect(pane.className).toContain("grid-cols-3");
  });

  it("inline ペインは全幅にせずアクションと同じ行に並ぶ", () => {
    render(
      <ListCard mdCols="md:grid-cols-[1fr_auto]">
        <ListCardPane inline>担当</ListCardPane>
        <ListCardPane action>操作</ListCardPane>
      </ListCard>,
    );
    const pane = screen.getByText("担当");
    expect(pane.className).not.toContain("col-span-2");
    expect(pane.className).toContain("border-r");
  });

  it("action ペインは全幅にならず折り返す", () => {
    render(
      <ListCard mdCols="md:grid-cols-[1fr_auto]">
        <ListCardPane>品番</ListCardPane>
        <ListCardPane action>操作</ListCardPane>
      </ListCard>,
    );
    const pane = screen.getByText("操作");
    expect(pane.className).not.toContain("col-span-2");
    expect(pane.className).toContain("flex-wrap");
  });
});
