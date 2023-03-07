import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../firebase/sever";
import { HistoryType } from "../../../../types/HistoryType";

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
    const { slug } = req.query;
    const startDay = slug[0] || process.env.NEXT_PUBLIC_BASE_DATE;
    const endDay = slug[1];
    const querySnapshot = await db
      .collection("fabricDyeingConfirms")
      // .where("quantity",">" ,0)
      .orderBy("fixedAt")
      .startAt(startDay)
      .endAt(endDay)
      .get();
    const snapshot = querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as HistoryType)
    );
    return res.status(200).json({ contents: snapshot });
  }
}
