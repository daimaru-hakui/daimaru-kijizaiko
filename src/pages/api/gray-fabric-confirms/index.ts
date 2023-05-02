import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../firebase/sever";
import { History } from "../../../../types";

type Data = {
  contents: History[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.query.API_KEY !== process.env.BACKEND_API_KEY)
    return res.status(405).json("error");
  if (req.method === "GET") {
    
    const { slug, staff } = req.query;
    const startDay = slug[0]
    const endDay = slug[1]
    const querySnapshot = await db
      .collection("grayFabricConfirms")
      .get();
    const contents = querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as History)
    );
    return res.status(200).json({ contents });
  }
}
