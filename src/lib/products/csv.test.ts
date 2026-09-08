import { describe, it, expect } from "vitest";
import { buildProductCsv } from "./csv";
import type { Product } from "../../../types";

type ProductRow = Omit<Product, "createdAt" | "updatedAt">;

const base: ProductRow = {
  id: "p1",
  productType: 1,
  productNumber: "A-001",
  productNum: "A",
  colorNum: "001",
  colorName: "白",
  productName: "テスト生地",
  price: 1000,
  wip: 10,
  externalStock: 5,
  arrivingQuantity: 20,
  tokushimaStock: 30,
  materialName: "綿",
  materials: [],
  fabricWidth: 150,
  fabricLength: 0,
  fabricWeight: 0,
  features: ["防水", "UVカット"],
  staff: "uid1",
  supplierId: "s1",
  supplierName: "テスト仕入先",
  grayFabricId: "",
  noteProduct: "",
  noteFabric: "",
  noteEtc: "",
  interfacing: false,
  lining: false,
  locations: [],
  createUser: "uid1",
  updateUser: "uid1",
  cuttingSchedules: [],
};

const usersMap: Record<string, string> = { uid1: "田中" };

describe("buildProductCsv", () => {
  it("BOMヘッダー付きのCSV文字列を返す", () => {
    const csv = buildProductCsv([base], usersMap);
    expect(csv.startsWith("﻿")).toBe(true);
  });

  it("1行目はヘッダー行", () => {
    const csv = buildProductCsv([base], usersMap);
    const firstLine = csv.replace("﻿", "").split("\n")[0];
    expect(firstLine).toContain("担当");
    expect(firstLine).toContain("品番");
  });

  it("担当列にusersMapで解決された名前が入る", () => {
    const csv = buildProductCsv([base], usersMap);
    expect(csv).toContain("田中");
  });

  it("featuresはスペース区切りで結合される", () => {
    const csv = buildProductCsv([base], usersMap);
    expect(csv).toContain("防水 UVカット");
  });

  it('セル内にダブルクォートがあれば "" にエスケープされる', () => {
    const row = { ...base, productName: '含む"クォート' };
    const csv = buildProductCsv([row], usersMap);
    expect(csv).toContain('含む""クォート');
  });

  it("製品が0件のときヘッダー行だけ返す", () => {
    const csv = buildProductCsv([], usersMap);
    const lines = csv.replace("﻿", "").split("\n");
    expect(lines).toHaveLength(1);
  });
});
