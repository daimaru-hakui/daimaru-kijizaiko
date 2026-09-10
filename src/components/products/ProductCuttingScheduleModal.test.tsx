import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ProductCuttingScheduleModal } from "./ProductCuttingScheduleModal";
import { UserRolesProvider } from "@/components/app-shell/roles-context";
import { renderWithToast } from "@/test-utils/toast";
import type { UserRoles } from "@/components/app-shell/types";
import type { CuttingSchedule } from "../../../types";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const { deleteScheduleAction } = vi.hoisted(() => ({
  deleteScheduleAction: vi.fn(),
}));
vi.mock("@/app/(app)/schedules/actions", () => ({ deleteScheduleAction }));

const NO_ROLES: UserRoles = {
  admin: false,
  rd: false,
  tokushima: false,
  accounting: false,
  sales: false,
};

const schedule: CuttingSchedule = {
  id: "s1",
  staff: "user1",
  userRef: "",
  processNumber: "P-100",
  productId: "prod1",
  productRef: "",
  itemName: "テストアイテム",
  quantity: 50,
  scheduledAt: "2026-03-01",
};

const defaultProps = {
  scheduleIds: ["s1"],
  schedulesMap: { s1: schedule },
  usersMap: { user1: "山田太郎" },
};

const renderModal = (roles: Partial<UserRoles> = {}) => {
  renderWithToast(
    <UserRolesProvider roles={{ ...NO_ROLES, ...roles }}>
      <ProductCuttingScheduleModal {...defaultProps} />
    </UserRolesProvider>,
  );
};

describe("ProductCuttingScheduleModal 削除ボタン", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("徳島工場ロールがないユーザーには削除ボタンが表示されない", async () => {
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: "50m" }));
    expect(screen.queryByRole("button", { name: "削除" })).toBeNull();
  });

  it("徳島工場ロールのユーザーには削除ボタンが表示される", async () => {
    renderModal({ tokushima: true });
    await userEvent.click(screen.getByRole("button", { name: "50m" }));
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("削除ボタンを押すと確認の上で deleteScheduleAction が呼ばれ、成功すると画面を更新する", async () => {
    deleteScheduleAction.mockResolvedValue({ ok: true });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderModal({ tokushima: true });

    await userEvent.click(screen.getByRole("button", { name: "50m" }));
    await userEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(deleteScheduleAction).toHaveBeenCalledWith("s1", "prod1");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("削除に失敗するとエラーがトーストで表示される", async () => {
    deleteScheduleAction.mockResolvedValue({ ok: false, error: "権限がありません" });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderModal({ tokushima: true });

    await userEvent.click(screen.getByRole("button", { name: "50m" }));
    await userEvent.click(screen.getByRole("button", { name: "削除" }));

    expect(await screen.findByText("権限がありません")).toBeInTheDocument();
  });
});
