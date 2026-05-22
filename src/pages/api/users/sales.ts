import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "@/lib/firebase/admin";
import { withAuth } from "@/lib/auth/with-auth";
import { User } from "../../../../types";

type Data = { contents: User[] };

async function handler(req: NextApiRequest, res: NextApiResponse<Data | string>) {
  const db = getAdminDb();
  if (req.method === "GET") {
    const querySnapshot = await db
      .collection("users")
      .where("sales", "==", true)
      .get();
    const contents = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id } as User))
      .sort((a, b) => (a.rank < b.rank ? -1 : 1));
    return res.status(200).json({ contents });
  }
}

export default withAuth(handler);
