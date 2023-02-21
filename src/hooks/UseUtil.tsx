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
    return `${year}-${monthStr}-${day}`;
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

  return { quantityValueBold, getTodayDate, halfToFullChar, mathRound2nd };
};
