// [Layer: UserRoles/Features/Pages/CashiersPanel/Shared]
// RadioGroupField.tsx -- Reusable payment and transaction radio group primitive.
// DO NOT put business logic or API calls here.
import { FC } from 'react';
import { RadioOption } from '../../CustomersPanel/Shared/RadioGroupField';

interface CashierRadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (val: string) => void;
}

export const RadioGroupField: FC<CashierRadioGroupProps> = ({
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
          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
            selectedValue === opt.value
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-outline-variant/30 hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selectedValue === opt.value}
              onChange={() => onChange(opt.value)}
              className="text-primary focus:ring-primary"
            />
            <span className="font-small text-small font-semibold text-text-primary">{opt.label}</span>
          </div>
          {opt.description && (
            <span className="font-caption text-caption text-text-secondary">{opt.description}</span>
          )}
        </label>
      ))}
    </div>
  );
};

export default RadioGroupField;
