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
    const querySnapshot = await db
      .collection("fabricDyeingOrders")
      .where("quantity", ">", 0)
      .get();
    const snapshot = querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as History)
    );
    return res.status(200).json({ contents: snapshot });
  }
}
