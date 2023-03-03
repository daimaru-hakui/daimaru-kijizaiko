import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase/sever";
import { CuttingReportType } from "../../../types/CuttingReportType";
import { HistoryType } from "../../../types/HistoryType";

type Data = {
  fabricPurchaseConfirms:HistoryType[];
  cuttingReports: CuttingReportType[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.method === "GET") {
    if (process.env.BACKEND_API_KEY) {
      const {startDay,endDay,limitNum} = req.query
      const fabricPurchaseConfirmsRef = await db
        .collection("fabricPurchaseConfirms")
        .orderBy("fixedAt")
        .startAt(startDay)
        .endAt(endDay)
        .limit(Number(limitNum))
        .get();
      const snapshot1 = fabricPurchaseConfirmsRef.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as HistoryType)
      );

      const cuttingReportsRef = await db
        .collection("cuttingReports")
        .orderBy("cuttingDate")
        .startAt(startDay)
        .endAt(endDay)
        .limit(Number(limitNum))
        .get();
      const snapshot2 = cuttingReportsRef.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType)
      );
      return res.status(200).json({
        fabricPurchaseConfirms: snapshot1,
        cuttingReports: snapshot2
      });
    } else {
      return res.status(405).json("error");
    }
  }
  
}
