import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../firebase/sever";
import { ProductType } from "../../../../types";

type Data = {
  content: ProductType;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.query.API_KEY !== process.env.BACKEND_API_KEY)
    return res.status(405).json("error");
  if (req.method === "GET") {
    const { id } = req.query;
    const querySnapshot = await db.collection("products").doc(`${id}`).get();
    const content = {
      ...querySnapshot.data(),
      id: querySnapshot.id,
    } as ProductType;
    return res.status(200).json({ content });
  }
}
