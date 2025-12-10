
import * as React from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ options, value, placeholder, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string | undefined>(value);

  const handleSelect = (val: string) => {
    setSelected(val);
    onChange?.(val);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        className="w-full border rounded-lg px-3 py-2 text-left bg-white shadow-sm focus:ring-2 focus:ring-red-500"
        onClick={() => setOpen(!open)}
      >
        {selected || placeholder || "Select option"}
      </button>
      {open && (
        <div className="absolute z-10 mt-2 w-full rounded-lg border bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="px-4 py-2 w-full text-left hover:bg-red-50"
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
