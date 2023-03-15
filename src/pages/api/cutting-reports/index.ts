import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../firebase/sever";
import { CuttingReportType } from "../../../../types/CuttingReportType";

const getTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  let monthStr = "0" + month;
  monthStr = monthStr.slice(-2);
  const day = date.getDate();
  let dayStr = "0" + day;
  dayStr = dayStr.slice(-2);
  return `${year}-${monthStr}-${dayStr}`;
};

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
    const querySnapshot = await db
      .collection("cuttingReports")
      .orderBy("cuttingDate", "desc")
      .startAt(getTodayDate())
      .endAt(getTodayDate())
      .get();
    const contents = querySnapshot.docs.flatMap(
      (doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType)
    );
    return res.status(200).json({ contents });
  }
}
