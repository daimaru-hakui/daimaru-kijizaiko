import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ProductListTable } from "./ProductListTable";
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
vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: <T,>(value: T) => value,
}));

const makeProduct = (
  overrides: Partial<Omit<Product, "createdAt" | "updatedAt">> = {},
): Omit<Product, "createdAt" | "updatedAt"> => ({
  id: "p1",
  productNumber: "DM-001",
  productNum: "DM001",
  colorName: "ブラック",
  colorNum: "BK",
  productName: "テスト生地",
  staff: "user1",
  supplierId: "sup1",
  supplierName: "テスト商社",
  grayFabricId: "",
  price: 1000,
  wip: 0,
  externalStock: 0,
  arrivingQuantity: 0,
  tokushimaStock: 100,
  materialName: "ポリエステル",
  materials: { t: 100 },
  fabricWidth: 110,
  fabricLength: 50,
  fabricWeight: null as unknown as number,
  features: [],
  cuttingSchedules: [],
  locations: [],
  noteProduct: "",
  noteFabric: "",
  noteEtc: "",
  interfacing: false,
  lining: false,
  createUser: "user1",
  updateUser: "user1",
  productType: 1,
  ...overrides,
});

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
    const input = screen.getByPlaceholderText("品番");
    await userEvent.type(input, "DM");
    expect(screen.queryByText("現在登録された情報はありません。")).toBeNull();
    expect(screen.getByText("DM-001")).toBeInTheDocument();
  });

  it("マッチしない品番を入力すると空状態が表示される", async () => {
    render(<ProductListTable {...defaultProps} />);
    const input = screen.getByPlaceholderText("品番");
    await userEvent.type(input, "XX");
    expect(
      screen.getByText("現在登録された情報はありません。"),
    ).toBeInTheDocument();
  });

  it("小文字で入力しても大文字品番にマッチする", async () => {
    render(<ProductListTable {...defaultProps} />);
    const input = screen.getByPlaceholderText("品番");
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
