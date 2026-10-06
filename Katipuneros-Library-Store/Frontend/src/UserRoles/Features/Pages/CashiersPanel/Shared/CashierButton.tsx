// [Layer: UserRoles/Features/Pages/CashiersPanel/Shared]
// CashierButton.tsx -- Delegates to the global Button primitive from Shared/Button.tsx.
// Maintains backward compatibility with all cashier features.
// DO NOT put business logic or API calls here.

import { FC } from 'react';
import { Button, ButtonProps } from '../../../../../Shared/Button';

export interface CashierButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
}

export const CashierButton: FC<CashierButtonProps> = ({
  variant = 'primary',
  ...props
}) => {
  const mappedVariant = variant === 'accent' ? 'secondary' : variant === 'primary' ? 'action-green' : variant;
  return <Button variant={mappedVariant as any} {...props} />;
};

export default CashierButton;
