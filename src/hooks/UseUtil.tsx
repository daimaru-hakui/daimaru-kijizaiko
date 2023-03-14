export const useUtil = () => {
  const quantityValueBold = (quantity: number) => {
    return quantity > 0 ? "bold" : "normal";
  };

  const getTodayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let monthStr = "0" + month;
    monthStr = monthStr.slice(-2);
    const day = date.getDate();
    let dayStr = "0" + day;
    dayStr = dayStr.slice(-2);
    return `${year}-${monthStr}-${dayStr}`;
  };

  const getNow = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let monthStr = "0" + month;
    monthStr = monthStr.slice(-2);
    const day = date.getDate();
    let dayStr = "0" + day;
    dayStr = dayStr.slice(-2);
    const hour = date.getHours();
    let hourStr = "0" + hour;
    hourStr = hourStr.slice(-2);
    const min = date.getMinutes();
    let minStr = "0" + min;
    minStr = minStr.slice(-2);
    const sec = date.getSeconds();
    let secStr = "0" + sec;
    secStr = secStr.slice(-2);

    return `${year}年${monthStr}月${dayStr}日 ${hourStr}:${minStr}:${secStr}`;
  };

  // 半角から全角
  function halfToFullChar(str: string) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
  }

  const mathRound2nd = (num: number) => {
    return Math.round(num * 100) / 100;
  };

  return { quantityValueBold, getTodayDate, getNow, halfToFullChar, mathRound2nd };
};
