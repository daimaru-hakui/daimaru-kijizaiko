// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../firebase/sever";
import { ProductType } from "../../../types/FabricType";

type Data = {
  props:{}[]
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const q = db.collection('products').where('deletedAt', '==', '');
  q.onSnapshot(querySnapshot => {
    const result = querySnapshot.docs.map((doc) => (
      { ...doc.data(), id:doc.id }
    )).sort((a:ProductType, b:ProductType) => (
      a.productNumber < b.productNumber && -1
    ))
    res.status(200).json({ props: result });
  }, err => {
    console.log(`Encountered error: ${err}`);
  });
}
