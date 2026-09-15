// [Layer: UserRoles/Features/Pages/AdminsPanel/Shared]
// RadioGroupField.tsx -- Admin-scoped reusable radio group selector primitive.
// DO NOT put business logic or API calls here.
import { FC } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupFieldProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (val: string) => void;
  label?: string;
}

export const RadioGroupField: FC<RadioGroupFieldProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  label,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-small font-small cursor-pointer transition-all duration-150 select-none ${
                isSelected
                  ? 'bg-soft-blue/60 border-primary text-primary font-bold shadow-xs'
                  : 'bg-surface-container-lowest border-surface-container-high text-text-secondary hover:bg-surface-container-low'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange(opt.value)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <div className="flex flex-col">
                <span>{opt.label}</span>
                {opt.description && (
                  <span className="text-caption font-caption text-text-secondary">
                    {opt.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RadioGroupField;
