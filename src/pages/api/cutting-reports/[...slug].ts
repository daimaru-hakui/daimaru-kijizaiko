import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../firebase/sever";
import { CuttingReportType } from "../../../../types/CuttingReportType";

type Data = {
  contents: CuttingReportType[];
  count?: FirebaseFirestore.AggregateField<number>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.query.API_KEY !== process.env.BACKEND_API_KEY) {
    return res.status(405).json("error");
  }
  if (req.method === "GET") {
    const { slug } = req.query;
    const startDay = slug[0] || process.env.NEXT_PUBLIC_BASE_DATE;
    const endDay = slug[1];
    const querySnapshot = await db
      .collection("cuttingReports")
      .orderBy("cuttingDate")
      .startAt(startDay)
      .endAt(endDay)
      .get();
    const contents = querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType)
    );
    console.log(startDay);
    return res.status(200).json({ contents });
  }
}
