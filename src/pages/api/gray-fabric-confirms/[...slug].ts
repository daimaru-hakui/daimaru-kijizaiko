import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../firebase/sever";
import { HistoryType } from "../../../../types";

type Data = {
  contents: HistoryType[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.query.API_KEY !== process.env.BACKEND_API_KEY)
    return res.status(405).json("error");
  if (req.method === "GET") {
    
    const { slug, createUser } = req.query;
    const startDay = slug[0]
    const endDay = slug[1]
    const querySnapshot = await db
      .collection("grayFabricConfirms")
      .orderBy("fixedAt")
      .startAt(startDay)
      .endAt(endDay)
      .get();
    const contents = querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as HistoryType)
    )
      .sort((a, b) => {
        if (a.fixedAt > b.fixedAt) {
          return -1;
        }
      });
    console.log('grayFabric-confirms')
    return res.status(200).json({ contents });
  }
}




