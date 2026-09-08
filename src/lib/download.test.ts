import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadCsv } from "./download";

describe("downloadCsv", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("指定したファイル名で <a> のダウンロードが発火する", () => {
    const click = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue({
      click,
      href: "",
      download: "",
    } as unknown as HTMLAnchorElement);

    downloadCsv("content", "test.csv");

    expect(click).toHaveBeenCalledOnce();
  });

  it("download 属性に渡したファイル名がセットされる", () => {
    const anchor = { click: vi.fn(), href: "", download: "" } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    downloadCsv("content", "生地一覧.csv");

    expect(anchor.download).toBe("生地一覧.csv");
  });

  it("Blob の URL は click 後に revoke される", () => {
    vi.spyOn(document, "createElement").mockReturnValue({
      click: vi.fn(),
      href: "",
      download: "",
    } as unknown as HTMLAnchorElement);

    downloadCsv("content", "test.csv");

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });
});
