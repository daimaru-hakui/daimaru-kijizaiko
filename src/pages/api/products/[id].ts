import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminDb } from "@/lib/firebase/admin";
import { withAuth } from "@/lib/auth/with-auth";
import { Product } from "../../../../types";

type Data = { content: Product };

async function handler(req: NextApiRequest, res: NextApiResponse<Data | string>) {
  const db = getAdminDb();
  if (req.method === "GET") {
    const { id } = req.query;
    const querySnapshot = await db.collection("products").doc(`${id}`).get();
    const content = { ...querySnapshot.data(), id: querySnapshot.id } as Product;
    return res.status(200).json({ content });
  }
}

export default withAuth(handler);
