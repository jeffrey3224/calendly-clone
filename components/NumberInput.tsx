import { ChevronUp, ChevronDown } from "lucide-react";
import { FC } from "react";

type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export const NumberInput: FC<NumberInputProps> = ({ value, onChange, min = 0, max = 999, step = 1 }) => {
  const increment = () => onChange(Math.min(value + step, max));
  const decrement = () => onChange(Math.max(value - step, min));

  return (
    <div className="text-[.9rem] relative inline-flex items-center justify-between border rounded-md overflow-hidden">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 px-2 py-1 text-left appearance-none outline-none"
      />
      <div className="flex flex-col pr-5">
        <button
          type="button"
          onClick={increment}
          className="hover:bg-gray-100 flex items-center justify-center"
        >
          <ChevronUp size={16} className="text-gray-400"/>
        </button>
        <button
          type="button"
          onClick={decrement}
          className="hover:bg-gray-100 flex items-center justify-center"
        >
          <ChevronDown size={16} className="text-gray-400"/>
        </button>
      </div>
    </div>
  );
};
