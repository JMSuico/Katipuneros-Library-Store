// [Layer: UserRoles/Features/Pages/AdminsPanel/Shared]
// AdminSwitch.tsx -- Role-scoped adapter re-exporting the global Switch primitive from Shared/Switch.tsx.
// Maintains backward compatibility with all admin features.
// DO NOT put business logic or API calls here.

import { FC } from 'react';
import { Switch, SwitchProps } from '../../../../../Shared/Switch';

export type AdminSwitchProps = SwitchProps;
export const AdminSwitch: FC<AdminSwitchProps> = (props) => <Switch {...props} />;

export default AdminSwitch;
