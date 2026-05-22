import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "@/lib/firebase/admin";
import { withAuth } from "@/lib/auth/with-auth";
import { History } from "../../../../types";

type Data = { contents: History[] };

async function handler(req: NextApiRequest, res: NextApiResponse<Data | string>) {
  const db = getAdminDb();
  if (req.method === "GET") {
    const querySnapshot = await db
      .collection("fabricPurchaseConfirms")
      .where("quantity", ">", 0)
      .get();
    const snapshot = querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as History)
    );
    return res.status(200).json({ contents: snapshot });
  }
}

export default withAuth(handler);
