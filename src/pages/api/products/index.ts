import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "@/lib/firebase/admin";
import { withAuth } from "@/lib/auth/with-auth";
import { Product } from "../../../../types";

type Data = { contents: Product[] };

async function handler(req: NextApiRequest, res: NextApiResponse<Data | string>) {
  const db = getAdminDb();
  if (req.method === "GET") {
    const querySnapshot = await db
      .collection("products")
      .where("deletedAt", "==", "")
      .get();
    const contents = querySnapshot.docs.map(
      (doc) => ({ ...doc.data(), id: doc.id } as Product)
    );
    return res.status(200).json({ contents });
  }
}

export default withAuth(handler);
