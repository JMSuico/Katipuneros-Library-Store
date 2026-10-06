// [Layer: UserRoles/Features/Pages/CustomersPanel/Shared]
// CustomerButton.tsx -- Delegates to the global Button primitive from Shared/Button.tsx.
// Maintains backward compatibility with all customer features.
// DO NOT put business logic or API calls here.

import { FC } from 'react';
import { Button, ButtonProps } from '../../../../../Shared/Button';

export interface CustomerButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const CustomerButton: FC<CustomerButtonProps> = ({
  variant = 'primary',
  className = '',
  ...props
}) => {
  const mappedVariant = variant === 'primary' ? 'action-green' : variant;
  return <Button variant={mappedVariant as any} className={`rounded-full ${className}`} {...props} />;
};

export default CustomerButton;
