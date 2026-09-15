// [Layer: UserRoles/Features/Pages/CustomersPanel/Shared]
// RadioGroupField.tsx -- Reusable radio button selector group primitive.
// DO NOT put business logic or API calls here.
import { FC } from 'react';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
}

interface RadioGroupFieldProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const RadioGroupField: FC<RadioGroupFieldProps> = ({
  name,
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
            selectedValue === opt.value
              ? 'border-primary bg-primary/5'
              : 'border-outline-variant/40 hover:bg-surface-container-low'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={selectedValue === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 text-primary focus:ring-primary"
          />
          <div className="flex flex-col">
            <span className="font-small text-small font-semibold text-text-primary">{opt.label}</span>
            {opt.description && (
              <span className="font-caption text-caption text-text-secondary">{opt.description}</span>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

export default RadioGroupField;
