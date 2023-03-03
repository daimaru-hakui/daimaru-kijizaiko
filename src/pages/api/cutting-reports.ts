import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase/sever";
import { CuttingReportType } from "../../../types/CuttingReportType";

type Data = {
  contents: CuttingReportType[];
  count: FirebaseFirestore.AggregateField<number>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.method === "GET") {
    if (process.env.BACKEND_API_KEY) {
      const { startDay, endDay, limitNum } = req.query;
      const collectionRef = db.collection("cuttingReports");
      const snapshot = await collectionRef.orderBy("cuttingDate")
        .startAt(startDay)
        .endAt(endDay)
        .limit(Number(limitNum)).get();
      
      const contents = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType)
      );

      const countsnap = await collectionRef.count().get();
      const count = countsnap.data().count;

      return res.status(200).json({ contents, count });
    } else {
      return res.status(405).json("error");
    }
  }

}
