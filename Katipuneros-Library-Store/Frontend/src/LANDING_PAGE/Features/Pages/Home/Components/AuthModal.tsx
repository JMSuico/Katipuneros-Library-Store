// [Layer: LANDING_PAGE/Features/Pages/Home/Components]
// AuthModal.tsx -- Re-exporting canonical Shared/Components/AuthModal to eliminate duplicate login UI.
// Preserves single source of truth across all landing and chrome components.
// DO NOT re-implement login interfaces here.

export { AuthModal, default } from '../../../../../Shared/Components/AuthModal';
