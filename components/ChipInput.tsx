
import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface Props {
  chips: string[];
  onChange: (chips: string[]) => void;
  placeholder?: string;
  color: 'indigo' | 'emerald';
}

const ChipInput: React.FC<Props> = ({ chips, onChange, placeholder, color }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!chips.includes(inputValue.trim())) {
        onChange([...chips, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && chips.length > 0) {
      onChange(chips.slice(0, -1));
    }
  };

  const removeChip = (indexToRemove: number) => {
    onChange(chips.filter((_, index) => index !== indexToRemove));
  };

  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="min-h-[42px] p-1.5 flex flex-wrap gap-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 bg-white transition-all">
      {chips.map((chip, index) => (
        <span
          key={index}
          className={`flex items-center gap-1 px-2 py-0.5 border rounded-md text-xs font-medium animate-in zoom-in-95 duration-200 ${colorClasses[color]}`}
        >
          {chip}
          <button
            type="button"
            onClick={() => removeChip(index)}
            className="hover:text-red-600 focus:outline-none"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        className="flex-1 outline-none text-sm min-w-[120px] bg-transparent"
        placeholder={chips.length === 0 ? placeholder : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default ChipInput;
