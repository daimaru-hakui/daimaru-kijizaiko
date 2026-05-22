import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "@/lib/firebase/admin";
import { withAuth } from "@/lib/auth/with-auth";
import { User, CuttingReportType } from "../../../../types";

type Data = {
  contents: CuttingReportType[];
  count?: FirebaseFirestore.AggregateField<number>;
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data | string>) {
  const db = getAdminDb();
  if (req.method === "GET") {
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as User)
    );

    const querySnapshot = await db
      .collection("cuttingReports")
      .orderBy("createdAt", "desc")
      .get();

    const reports = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType))
      .filter((report) => Number(report?.itemType) === 1);
    const contents = reports.map((content) => {
      const user = users.find((u) => u.uid === content.staff);
      return { ...content, username: user?.name };
    });
    return res.status(200).json({ contents });
  }
}

export default withAuth(handler);
