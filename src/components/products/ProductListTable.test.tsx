import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ProductListTable } from "./ProductListTable";
import { makeProduct } from "./product.fixture";
import type { Product, StockPlace } from "../../../types";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: mockPush }),
}));

vi.mock("@/app/(app)/products/history-actions", () => ({
  getProductCuttingHistoryAction: vi.fn().mockResolvedValue({ ok: true, contents: [] }),
  getProductPurchaseHistoryAction: vi.fn().mockResolvedValue({ ok: true, contents: [] }),
}));

// デバウンスをバイパス。タイミング動作は useDebounce.test.ts でカバー済み
vi.mock("@/hooks/useDebounce", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/useDebounce")>()),
  useDebounce: <T,>(value: T) => value,
}));

const defaultProps = {
  products: [makeProduct()],
  usersMap: { user1: "山田太郎" },
  suppliersMap: { sup1: "テスト商社" },
  locationsMap: {},
  grayFabricsMap: {},
  cuttingSchedulesMap: {},
  stockPlaces: [] as StockPlace[],
  userId: "user1",
  isAdmin: false,
  isRD: false,
};

describe("ProductListTable 品番検索", () => {
  it("半角で品番の一部を入力するとマッチする品番が表示される", async () => {
    render(<ProductListTable {...defaultProps} />);
    const input = screen.getByLabelText("品番");
    await userEvent.type(input, "DM");
    expect(screen.queryByText("現在登録された情報はありません。")).toBeNull();
    expect(screen.getByText("DM-001")).toBeInTheDocument();
  });

  it("マッチしない品番を入力すると空状態が表示される", async () => {
    render(<ProductListTable {...defaultProps} />);
    const input = screen.getByLabelText("品番");
    await userEvent.type(input, "XX");
    expect(
      screen.getByText("現在登録された情報はありません。"),
    ).toBeInTheDocument();
  });

  it("小文字で入力しても大文字品番にマッチする", async () => {
    render(<ProductListTable {...defaultProps} />);
    const input = screen.getByLabelText("品番");
    await userEvent.type(input, "dm");
    expect(screen.queryByText("現在登録された情報はありません。")).toBeNull();
  });
});

describe("ProductListTable 生地の編集", () => {
  it("詳細ダイアログの編集ボタンから編集画面へ遷移する", async () => {
    render(<ProductListTable {...defaultProps} isRD />);

    await userEvent.click(screen.getByRole("button", { name: "詳細" }));
    await userEvent.click(screen.getByRole("button", { name: "編集" }));

    expect(mockPush).toHaveBeenCalledWith("/products/p1/edit");
  });

  it("編集権限がないときは編集ボタンを表示しない", async () => {
    render(
      <ProductListTable
        {...defaultProps}
        isRD={false}
        isAdmin={false}
        userId="other-user"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "詳細" }));

    expect(screen.queryByRole("button", { name: "編集" })).toBeNull();
  });
});

describe("ProductListTable 履歴", () => {
  it("詳細ダイアログから裁断履歴を開ける", async () => {
    render(<ProductListTable {...defaultProps} />);

    await userEvent.click(screen.getByRole("button", { name: "詳細" }));
    await userEvent.click(screen.getByRole("button", { name: "裁断履歴" }));

    expect(
      await screen.findByRole("heading", { name: "裁断履歴" }),
    ).toBeInTheDocument();
  });

  it("詳細ダイアログから入荷履歴を開ける", async () => {
    render(<ProductListTable {...defaultProps} />);

    await userEvent.click(screen.getByRole("button", { name: "詳細" }));
    await userEvent.click(screen.getByRole("button", { name: "入荷履歴" }));

    expect(
      await screen.findByRole("heading", { name: "入荷履歴" }),
    ).toBeInTheDocument();
  });
});

describe("ProductListTable 担当者検索", () => {
  it("担当者を選ぶとその担当の生地だけが表示される", async () => {
    const user = userEvent.setup();
    render(
      <ProductListTable
        {...defaultProps}
        products={[
          makeProduct(),
          makeProduct({ id: "p2", productNumber: "XX-002", staff: "user2" }),
        ]}
        usersMap={{ user1: "山田太郎", user2: "佐藤花子" }}
      />,
    );

    await user.selectOptions(screen.getByLabelText("担当"), "user2");

    expect(screen.getByText("XX-002")).toBeInTheDocument();
    expect(screen.queryByText("DM-001")).toBeNull();
  });
});
