import { getMixed, getFabricStd } from "@/lib/utils";
import type { Product } from "../../../types";

type ProductRow = Omit<Product, "createdAt" | "updatedAt">;

const HEADERS = [
  "担当",
  "品番",
  "色番",
  "色",
  "品名",
  "単価",
  "生地仕掛",
  "外部在庫",
  "入荷待ち",
  "徳島在庫",
  "組織名",
  "混率",
  "規格",
  "機能性",
];

function escapeCsvCell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function buildProductCsv(
  products: ProductRow[],
  usersMap: Record<string, string>,
): string {
  const rows = products.map((p) => [
    usersMap[p.staff] ?? p.staff,
    p.productNum,
    p.colorNum,
    p.colorName,
    p.productName,
    p.price,
    p.wip,
    p.externalStock,
    p.arrivingQuantity,
    p.tokushimaStock,
    p.materialName,
    getMixed(p.materials as Parameters<typeof getMixed>[0]).join(" "),
    getFabricStd(p.fabricWidth, p.fabricLength, p.fabricWeight),
    (p.features ?? []).join(" "),
  ]);

  const csv = [HEADERS, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");

  return "﻿" + csv;
}
