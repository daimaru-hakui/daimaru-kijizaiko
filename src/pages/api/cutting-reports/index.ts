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
    const querySnapshot = await db
      .collection("cuttingReports")
      .orderBy("cuttingDate", "desc")
      .get();
    const contents = querySnapshot.docs.flatMap(
      (doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType)
    );
    return res.status(200).json({ contents });
  }
      
  // const query = db.collection("cuttingReports").orderBy("cuttingDate",'desc')
  // query.onSnapshot(querySnapshot => {
  //  const contents = querySnapshot.docs.map((doc) => (
  //     ({ ...doc.data(), id: doc.id } as CuttingReportType)
  //   ))
  //   return res.status(200).json({ contents });
  // } )
}
