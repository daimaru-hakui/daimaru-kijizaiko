import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ProductListTable } from "./ProductListTable";
import { makeProduct } from "./product.fixture";
import type { CuttingSchedule, StockPlace } from "../../../types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/app/(app)/products/history-actions", () => ({
  getProductCuttingHistoryAction: vi.fn().mockResolvedValue({ ok: true, contents: [] }),
  getProductPurchaseHistoryAction: vi.fn().mockResolvedValue({ ok: true, contents: [] }),
}));

vi.mock("@/hooks/useDebounce", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/useDebounce")>()),
  useDebounce: <T,>(value: T) => value,
}));

const scheduled = makeProduct({
  id: "p1",
  productNumber: "AAA-001",
  cuttingSchedules: ["s1"],
});
const notScheduled = makeProduct({
  id: "p2",
  productNumber: "BBB-002",
  cuttingSchedules: [],
});

const defaultProps = {
  products: [scheduled, notScheduled],
  usersMap: { user1: "山田太郎" },
  suppliersMap: { sup1: "テスト商社" },
  locationsMap: {},
  grayFabricsMap: {},
  cuttingSchedulesMap: {
    s1: { id: "s1", quantity: 10 } as unknown as CuttingSchedule,
  },
  stockPlaces: [] as StockPlace[],
  userId: "user1",
  isAdmin: false,
  isRD: false,
};

describe("ProductListTable 裁断予定の絞り込み", () => {
  it("初期表示では裁断予定の有無にかかわらず全件表示される", () => {
    render(<ProductListTable {...defaultProps} />);
    expect(screen.getByText("AAA-001")).toBeInTheDocument();
    expect(screen.getByText("BBB-002")).toBeInTheDocument();
  });

  it("裁断予定ありをオンにすると裁断予定のある生地だけになる", async () => {
    render(<ProductListTable {...defaultProps} />);
    await userEvent.click(screen.getByLabelText("裁断予定あり"));
    expect(screen.getByText("AAA-001")).toBeInTheDocument();
    expect(screen.queryByText("BBB-002")).toBeNull();
  });
});
