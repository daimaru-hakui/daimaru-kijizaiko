import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { formatSerialNumber } from "@/lib/serialnumbers/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// serialNumbers コレクションは各発注タイプのカウンタを保持するだけで
// リアルタイム更新は不要なため RSC の静的取得で十分
type SerialNumberDoc = {
  id: string;
  name: string;
  serialNumber: number;
};

export default async function SerialNumbersPage() {
  // 管理者のみアクセス可 (Firestore users.admin === true)
  const user = await verifyAdminSession();
  if (!user) redirect("/login");

  const snap = await getAdminDb().collection("serialNumbers").get();
  // TODO(phase5): Firestore DocumentData → SerialNumberDoc 型変換 (zod バリデーション)
  const serialNumbers: SerialNumberDoc[] = snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name ?? "",
    serialNumber: d.data().serialNumber ?? 0,
  }));

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-lg mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-5">発注ナンバー</h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">種類</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">伝票ナンバー</TableHead>
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
      </div>
    </div>
  );
}
