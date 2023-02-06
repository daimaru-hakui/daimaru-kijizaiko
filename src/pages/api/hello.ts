// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
  base: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(req.headers.api_key);
  if (req.headers.api_key) {
    res.status(200).json({ name: "John Doe", base: req.headers.api_key });
  } else {
    res.status(404);
    res.end("");
  }
}
