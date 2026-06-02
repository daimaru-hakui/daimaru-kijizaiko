import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, type MockInstance } from "vitest";
import { ProductOrderDialog } from "./ProductOrderDialog";
import type { SerializableProduct, StockPlace } from "../../../types";

/* ── 外部依存モック ── */
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/products/fabric-dyeing/actions", () => ({
  orderFabricDyeingFromStockAction: vi.fn().mockResolvedValue({ ok: true }),
  orderFabricDyeingFromRunningAction: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("@/app/products/fabric-purchase/actions", () => ({
  orderFabricPurchaseAction: vi.fn().mockResolvedValue({ ok: true }),
}));

/* ── テスト用フィクスチャ ── */
const mockProduct: SerializableProduct = {
  id: "prod-1",
  productType: 1,
  staff: "staff-1",
  supplierId: "supplier-1",
  supplierName: "テストサプライヤー",
  grayFabricId: "",
  productNumber: "TEST-001",
  productNum: "001",
  productName: "テスト生地",
  colorNum: "01",
  colorName: "ホワイト",
  price: 1000,
  materialName: "綿",
  materials: {},
  fabricWidth: 110,
  fabricWeight: 200,
  fabricLength: 50,
  features: [],
  noteProduct: "",
  noteFabric: "",
  noteEtc: "",
  interfacing: false,
  lining: false,
  cuttingSchedules: [],
  wip: 0,
  externalStock: 0,
  arrivingQuantity: 0,
  tokushimaStock: 0,
  locations: [],
  createUser: "user-1",
  updateUser: "user-1",
};

const mockStockPlaces: StockPlace[] = [
  {
    id: "sp-1",
    name: "徳島工場",
    kana: "とくしまこうじょう",
    address: "徳島県...",
    tel: "000-0000-0000",
    fax: "000-0000-0000",
    comment: "",
  },
];

describe("ProductOrderDialog — コメント必須バリデーション", () => {
  let alertSpy: MockInstance;
  let confirmSpy: MockInstance;

  beforeEach(() => {
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    confirmSpy = vi
      .spyOn(window, "confirm")
      .mockImplementation(() => true);
  });

  it("コメントが空のまま「発注する」を押すと alert が呼ばれてサブミットされない", async () => {
    const user = userEvent.setup();
    const onCloseAction = vi.fn();

    render(
      <ProductOrderDialog
        product={mockProduct}
        stockPlaces={mockStockPlaces}
        open={true}
        onCloseAction={onCloseAction}
      />,
    );

    // 在庫種別チップを選択（バリデーション順: stockType → comment）
    await user.click(
      screen.getByRole("button", { name: /生地を購入/ }),
    );

    // コメントは空のまま「発注する」を押す
    await user.click(screen.getByRole("button", { name: "発注する" }));

    expect(alertSpy).toHaveBeenCalledWith("コメントを入力してください");
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onCloseAction).not.toHaveBeenCalled();
  });

  it("コメントを入力して「発注する」を押すと alert が呼ばれない（バリデーション通過）", async () => {
    const user = userEvent.setup();
    const onCloseAction = vi.fn();

    render(
      <ProductOrderDialog
        product={mockProduct}
        stockPlaces={mockStockPlaces}
        open={true}
        onCloseAction={onCloseAction}
      />,
    );

    // 在庫種別チップを選択
    await user.click(
      screen.getByRole("button", { name: /生地を購入/ }),
    );

    // コメントを入力
    const commentInput = screen.getByPlaceholderText("必須");
    await user.type(commentInput, "テストコメント");

    // 「発注する」を押す
    await user.click(screen.getByRole("button", { name: "発注する" }));

    expect(alertSpy).not.toHaveBeenCalledWith("コメントを入力してください");
    expect(confirmSpy).toHaveBeenCalled();
  });
});
