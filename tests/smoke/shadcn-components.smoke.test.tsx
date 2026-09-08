import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

describe("shadcn/ui 基本コンポーネント smoke test", () => {
  it("Button が import・render できる", () => {
    render(<Button>テスト</Button>);
    expect(screen.getByRole("button", { name: "テスト" })).toBeInTheDocument();
  });

  it("Input が render できる", () => {
    render(<Input placeholder="入力してください" />);
    expect(
      screen.getByPlaceholderText("入力してください")
    ).toBeInTheDocument();
  });
});
