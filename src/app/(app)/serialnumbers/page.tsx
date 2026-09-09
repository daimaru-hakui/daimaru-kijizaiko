import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { formatSerialNumber } from "@/lib/serialnumbers/format";
import { parseDocs } from "@/lib/firestore/parse";
import { serialNumberSchema } from "@/lib/firestore/schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HEAD } from "@/components/ui/table-styles";
import { PageContainer } from "@/components/ui/page-container";

// serialNumbers コレクションは各発注タイプのカウンタを保持するだけで
// リアルタイム更新は不要なため RSC の静的取得で十分

export default async function SerialNumbersPage() {
  // 管理者のみアクセス可 (Firestore users.admin === true)
  const user = await verifyAdminSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("serialNumbers").get();
  const serialNumbers = parseDocs(snap.docs, serialNumberSchema, "serialNumbers");

  return (
    <PageContainer maxWidth="max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-5">発注ナンバー</h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className={HEAD}>種類</TableHead>
              <TableHead className={HEAD}>伝票ナンバー</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serialNumbers.map((sn) => (
              <TableRow key={sn.id}>
                <TableCell>{sn.name}</TableCell>
                <TableCell className="font-mono">{formatSerialNumber(sn.serialNumber)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}
