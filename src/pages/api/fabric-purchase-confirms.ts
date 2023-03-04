import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase/sever";
import { HistoryType } from "../../../types/HistoryType";

type Data = {
  contents: HistoryType[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.method === "GET") {
    if (process.env.BACKEND_API_KEY) {
      const docsRef = await db
        .collection("fabricPurchaseConfirms")
        .orderBy("fixedAt",'desc')
        .get();
      const snapshot = docsRef.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as HistoryType)
      );
      return res.status(200).json({ contents: snapshot });
    } else {
      return res.status(405).json("error");
    }
  }
  
}