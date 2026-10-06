// [Layer: UserRoles/Features/Pages/CashiersPanel/Shared]
// RadioGroupField.tsx -- Delegates to the global RadioGroup primitive from Shared/RadioButton.tsx.
// Maintains backward compatibility with all cashier features.
// DO NOT put business logic or API calls here.

import { FC } from 'react';
import { RadioGroup, RadioOption } from '../../../../../Shared/RadioButton';

export type { RadioOption };

export interface CashierRadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (val: string) => void;
}

export const RadioGroupField: FC<CashierRadioGroupProps> = (props) => (
  <RadioGroup {...props} direction="col" />
);

export default RadioGroupField;
