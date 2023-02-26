// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase";
import { ProductType } from "../../../types/FabricType";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // res.status(200).json({ name: "John Doe", base: req.headers.api_key });
  if (process.env.NEXT_PUBLIC_BASE_DATE) {
    console.log("1")
    // const q = query(
    //   collection(db, "products"),
    //   // where("deletedAt", "==", "")
    //   orderBy("productNumber", "asc")
    // );
    // let result = []
    // onSnapshot(q, (querySnap) =>
    //   result = (querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id } as ProductType))
    //  ))
    res.status(200).json({ name: "result" });
    
  } else {
    res.status(200);
  }
}
