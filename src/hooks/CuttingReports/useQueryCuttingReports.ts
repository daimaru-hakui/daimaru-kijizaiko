import { collection, endAt, getDocs, onSnapshot, orderBy, query, startAt, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { CuttingReportType } from '../../../types';
import { useQuery } from 'react-query';

export const useQueryCuttingReports = (startDay:string,endDay:string) => {
   
  const getCuttingReports = async () => {
    let data:CuttingReportType[] = [];
    const q = query(collection(db, "cuttingReports")
      ,orderBy("cuttingDate")
      ,startAt(startDay)
      ,endAt(endDay));
    const snapshot = await getDocs(q)
    data = snapshot.docs.map((doc) =>
    ({ ...doc.data(), id: doc.id } as CuttingReportType)
    ).sort((a, b) => a.serialNumber > b.serialNumber && -1)
    return data
  };

  
  return useQuery({
    queryKey:['cuttingReports'],
    queryFn: getCuttingReports
  })
}
