import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "@/lib/firebase/admin";
import { withAuth } from "@/lib/auth/with-auth";
import { CuttingReportType } from "../../../../types";

type Data = {
  contents: CuttingReportType[];
  count?: FirebaseFirestore.AggregateField<number>;
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data | string>) {
  const db = getAdminDb();
  if (req.method === "GET") {
    const { slug } = req.query;
    const startDay = (slug as string[])[0];
    const endDay = (slug as string[])[1];

    const querySnapshot = await db
      .collection("cuttingReports")
      .orderBy("cuttingDate")
      .startAt(startDay)
      .endAt(endDay)
      .get();
    const contents = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType))
      .sort(
        (a: CuttingReportType, b: CuttingReportType) =>
          a.serialNumber > b.serialNumber ? -1 : 1
      );
    return res.status(200).json({ contents });
  }
}

export default withAuth(handler);
