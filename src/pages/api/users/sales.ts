import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../firebase/sever";
import { UserType } from "../../../../types/UserType";

type Data = {
  contents: UserType[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  if (req.query.API_KEY !== process.env.BACKEND_API_KEY)
    return res.status(405).json("error");
  if (req.method === "GET") {
    const querySnapshot = await db
      .collection("users")
      .where("sales", "==", true)
      .get();
    const contents = querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as UserType)
    );
    return res.status(200).json({ contents });
  }
}
