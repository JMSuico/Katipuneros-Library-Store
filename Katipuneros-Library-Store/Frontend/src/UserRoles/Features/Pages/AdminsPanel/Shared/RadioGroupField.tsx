// [Layer: UserRoles/Features/Pages/AdminsPanel/Shared]
// RadioGroupField.tsx -- Re-exports the global RadioGroup primitive from Shared/RadioButton.tsx.
// Maintains backward compatibility with all admin features.
// DO NOT put business logic or API calls here.

import { FC } from 'react';
import { RadioGroup, RadioGroupProps, RadioOption } from '../../../../../Shared/RadioButton';

export type { RadioOption };
export type RadioGroupFieldProps = RadioGroupProps;

export const RadioGroupField: FC<RadioGroupProps> = (props) => <RadioGroup {...props} />;

export default RadioGroupField;
