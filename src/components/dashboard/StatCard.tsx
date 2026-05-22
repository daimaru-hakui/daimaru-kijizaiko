import { FC } from "react";

type Props = {
  title: string;
  quantity: string | number;
  unit: string;
  fontSize: string;
};

export const StatCard: FC<Props> = ({ title, quantity, unit, fontSize }) => {
  return (
    <div className="p-3 bg-white rounded-md shadow-md flex-1">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={fontSize === '4xl' ? 'font-bold text-4xl' : 'font-bold text-3xl'}>
        {quantity}
        <span className="text-sm ml-1">{unit}</span>
      </p>
    </div>
  );
};
