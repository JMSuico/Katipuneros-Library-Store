// [Layer: UserRoles/Features/Pages/AdminsPanel/Shared]
// AdminButton.tsx -- Re-exports the global Button primitive from Shared/Button.tsx.
// Maintains backward compatibility with all admin features.
// DO NOT put business logic or API calls here.

import { FC } from 'react';
import { Button, ButtonProps } from '../../../../../Shared/Button';

export type AdminButtonProps = ButtonProps;
export const AdminButton: FC<AdminButtonProps> = (props) => <Button {...props} />;

export default AdminButton;
