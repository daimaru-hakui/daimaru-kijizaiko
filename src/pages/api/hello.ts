// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // res.status(200).json({ name: "John Doe", base: req.headers.api_key });
  if (req.headers.api_key === process.env.NEXT_PUBLIC_BACKEND_API_KEY) {
    res.status(200).json({ name: "John Doe" });
  } else {
    res.status(200);
  }
}
