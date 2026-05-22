import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "@/lib/firebase/admin";
import { withAuth } from "@/lib/auth/with-auth";
import { History } from "../../../../types";

type Data = { contents: History[] };

async function handler(req: NextApiRequest, res: NextApiResponse<Data | string>) {
  const db = getAdminDb();
  if (req.method === "GET") {
    const { slug } = req.query;
    const startDay = (slug as string[])[0];
    const endDay = (slug as string[])[1];
    const querySnapshot = await db
      .collection("grayFabricConfirms")
      .orderBy("fixedAt")
      .startAt(startDay)
      .endAt(endDay)
      .get();
    const contents = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id } as History))
      .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1));
    return res.status(200).json({ contents });
  }
}

export default withAuth(handler);
