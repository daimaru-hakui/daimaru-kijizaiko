import { onSnapshot } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase/sever";
import { CuttingReportType } from "../../../types/CuttingReportType";

type Data = {
  contents: CuttingReportType[];
  count?: FirebaseFirestore.AggregateField<number>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.method === "GET") {
    if (process.env.BACKEND_API_KEY) {
      const query = db.collection("cuttingReports").orderBy("cuttingDate",'desc')
      query.onSnapshot(querySnapshot => {
       const contents = querySnapshot.docs.map((doc) => (
          ({ ...doc.data(), id: doc.id } as CuttingReportType)
        ))
        return res.status(200).json({ contents });
      } ) 
     
    } else {
      return res.status(405).json("error");
    }
  }
}
