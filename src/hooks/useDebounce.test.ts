import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期値をそのまま返す", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("delay 未満では値が更新されない", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );
    rerender({ value: "ab" });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("a");
  });

  it("delay 経過後に最新値へ更新される", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );
    rerender({ value: "ab" });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("ab");
  });

  it("連続入力はタイマーがリセットされ最後の値のみ反映される", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "" } },
    );
    rerender({ value: "a" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "ab" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "abc" });
    act(() => { vi.advanceTimersByTime(299); });
    expect(result.current).toBe("");

    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current).toBe("abc");
  });
});
