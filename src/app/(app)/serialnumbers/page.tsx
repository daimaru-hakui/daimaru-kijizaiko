import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth/session";
import { getSerialNumbersPageData } from "@/lib/serialnumbers/queries";
import { formatSerialNumber } from "@/lib/serialnumbers/format";
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

  const { serialNumbers } = await getSerialNumbersPageData();

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
