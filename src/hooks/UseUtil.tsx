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
  }
  return { quantityValueBold, getTodayDate }
}