// 今日の日付を取得
export const todayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  let monthStr = "0" + month;
  monthStr = monthStr.slice(-2);
  const day = date.getDate();
  return `${year}-${monthStr}-${day}`;
};

export const getSerialNumber = (serialNumber: number) => {
  const str = "0000000" + String(serialNumber);
  return str.slice(-7);
};

export const getUserName = (users: any, userId: string) => {
  const user = users?.find((user: { uid: string }) => userId === user.uid);
  return user?.name || "";
};
