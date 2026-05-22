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
    <div className="w-full mt-12">
      <div className="max-w-lg mx-auto my-6 p-6 rounded-md bg-white shadow-md">
        <h2 className="text-2xl font-bold mb-6">発注ナンバー</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>種類</TableHead>
              <TableHead>伝票ナンバー</TableHead>
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
  );
}
