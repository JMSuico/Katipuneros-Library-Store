// [Layer: UserRoles/Features/Pages/CustomersPanel/Shared]
// RadioGroupField.tsx -- Delegates to the global RadioGroup primitive from Shared/RadioButton.tsx.
// Maintains backward compatibility with all customer features.
// DO NOT put business logic or API calls here.

import { FC } from 'react';
import { RadioGroup, RadioOption } from '../../../../../Shared/RadioButton';

export type { RadioOption };

export interface CustomerRadioGroupProps {
  name: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const RadioGroupField: FC<CustomerRadioGroupProps> = (props) => (
  <RadioGroup {...props} direction="col" />
);

export default RadioGroupField;
