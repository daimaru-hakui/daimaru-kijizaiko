import { useState } from "react";
import { ProductType } from "../../types/FabricType";

export const useInputProduct = () => {
  const [items, setItems] = useState({
    id: "",
    productType: 0,
    staff: "",
    supplierId: "",
    supplierName: "",
    grayFabricId: "",
    productNumber: "",
    productNum: "",
    productName: "",
    colorNum: "",
    colorName: "",
    price: 0,
    materialName: "",
    materials: "",
    fabricWidth: 0,
    fabricWeight: 0,
    fabricLength: 0,
    features: [],
    noteProduct: "",
    noteFabric: "",
    noteEtc: "",
    wip: 0,
    externalStock: 0,
    arrivingQuantity: 0,
    tokushimaStock: 0,
    createUser: "",
    updateUser: "",
    createdAt: undefined,
    updatedAt: undefined,
  } as ProductType);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: any, name: string) => {
    const value = e;
    setItems({ ...items, [name]: value });
  };

  const handleRadioChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  const handleCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (e.target.checked) {
      setItems({
        ...items,
        [name]: [...(items["features"] || []), value],
      });
    } else {
      setItems({
        ...items,
        [name]: [
          ...items["features"]?.filter((feature: string) => feature !== value),
        ],
      });
    }
  };

  return {
    items,
    setItems,
    handleInputChange,
    handleNumberChange,
    handleRadioChange,
    handleCheckedChange,
  };
};
