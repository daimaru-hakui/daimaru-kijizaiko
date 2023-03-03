import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase/sever";
import { CuttingReportType } from "../../../types/CuttingReportType";

type Data = {
  contents: CuttingReportType[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (process.env.BACKEND_API_KEY) {
    const docsRef = await db
      .collection("cuttingReports")
      .orderBy("cuttingDate")
      .startAt(req.query.startDay)
      .endAt(req.query.endDay)
      .get();
    const snapshot = docsRef.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType)
    );
    return res.status(200).json({ contents: snapshot });
  } else {
    return res.status(405).json("error");
  }
}
