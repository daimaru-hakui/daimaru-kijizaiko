// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { signInWithEmailAndPassword } from 'firebase/auth';
import type { NextApiRequest, NextApiResponse } from 'next'
import { useRecoilValue } from 'recoil';
import { auth, db } from '../../../firebase';
import { currentUserState } from '../../../store';

type Data = {
  name: string
  base:any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

 
  // auth.signOut()
  console.log(auth.currentUser?.uid)
  res.status(200).json({ name: 'John Doe', base: auth.currentUser?.uid })

}
