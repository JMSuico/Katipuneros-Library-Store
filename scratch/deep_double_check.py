import os
import re
import json

base_dir = r"c:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE"

pages_map = {
    # Customer
    "Customer / Home & Dashboard": (
        os.path.join(base_dir, r"CustomerPage\NavHomePage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CustomersPanel\Pages\CustomerDashboard.tsx")
    ),
    "Customer / Catalog & OPAC Search": (
        os.path.join(base_dir, r"CustomerPage\NavCatalogPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CustomersPanel\Pages\CatalogPage.tsx")
    ),
    "Customer / Borrowings & Loan Ledger": (
        os.path.join(base_dir, r"CustomerPage\NavBorrowingsPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CustomersPanel\Pages\BorrowingsPage.tsx")
    ),
    "Customer / Reservations & Staging": (
        os.path.join(base_dir, r"CustomerPage\NavReservationPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CustomersPanel\Pages\ReservationsPage.tsx")
    ),
    "Customer / Favorites & Wishlist": (
        os.path.join(base_dir, r"CustomerPage\NavFavoritesPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CustomersPanel\Pages\FavoritesPage.tsx")
    ),
    "Customer / Profile & Patron Clearance": (
        os.path.join(base_dir, r"CustomerPage\NavProfile&Settings\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CustomersPanel\Pages\ProfileSettings.tsx")
    ),

    # Cashier
    "Cashier / Terminal Dashboard": (
        os.path.join(base_dir, r"CashierPage\SibarBarDashBoardPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\CashierDashboard.tsx")
    ),
    "Cashier / Pending Reservations & Pickup": (
        os.path.join(base_dir, r"CashierPage\SidebarPendingReservationPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\PendingReservations.tsx")
    ),
    "Cashier / Rapid Barcode Checkout": (
        os.path.join(base_dir, r"CashierPage\SideBarCheckoutBorrowPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\CheckoutBorrow.tsx")
    ),
    "Cashier / Returns & Condition Assessment": (
        os.path.join(base_dir, r"CashierPage\SidebarReturn&FinesPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\ReturnsFines.tsx")
    ),
    "Cashier / Patron Lookup & Clearance": (
        os.path.join(base_dir, r"CashierPage\SidebarCustomerLookupPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\CustomerLookup.tsx")
    ),
    "Cashier / Book Shelf Availability": (
        os.path.join(base_dir, r"CashierPage\SidebarBookAvailabilityPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\BookAvailability.tsx")
    ),
    "Cashier / Shift Schedules & Roster": (
        os.path.join(base_dir, r"CashierPage\SidebarSchedulesPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\Schedules.tsx")
    ),
    "Cashier / Overdue Fines & Waivers": (
        os.path.join(base_dir, r"CashierPage\SidebarOverdueandFinesPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\OverdueFines.tsx")
    ),
    "Cashier / Transactions & Register Ledger": (
        os.path.join(base_dir, r"CashierPage\SidebarTransactionPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\Transactions.tsx")
    ),
    "Cashier / Terminal Notifications & Broadcast": (
        os.path.join(base_dir, r"CashierPage\SidebarNotificationsPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages\Notifications.tsx")
    ),

    # Admin
    "Admin / Executive Dashboard": (
        os.path.join(base_dir, r"AdminPage\SidebarAdminDashboardPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\AdminDashboard.tsx")
    ),
    "Admin / User Management & Staff Directory": (
        os.path.join(base_dir, r"AdminPage\SiderbarUserManagementPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\UserManagement.tsx")
    ),
    "Admin / Books Catalog & MARC 21 Manager": (
        os.path.join(base_dir, r"AdminPage\SidebarBookManagementPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\BooksManager.tsx")
    ),
    "Admin / Master Reservations Queue": (
        os.path.join(base_dir, r"AdminPage\SidebarReservationPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Reservations.tsx")
    ),
    "Admin / Circulation Audit & Loan Policies": (
        os.path.join(base_dir, r"AdminPage\SidebarBorrowingsPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Borrowings.tsx")
    ),
    "Admin / Returns Clearance & Inspection Journal": (
        os.path.join(base_dir, r"AdminPage\SidebarReturnsPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Returns.tsx")
    ),
    "Admin / Physical Inventory & RFID Stacks": (
        os.path.join(base_dir, r"AdminPage\SidebarInventoryPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Inventory.tsx")
    ),
    "Admin / Circulation Analytics & Demographics": (
        os.path.join(base_dir, r"AdminPage\SiderbarAnalyticsPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Analytics.tsx")
    ),
    "Admin / Dewey Categories & Taxonomy": (
        os.path.join(base_dir, r"AdminPage\SidebarCategoriesPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Categories.tsx")
    ),
    "Admin / Official Compliance Reports Dossier": (
        os.path.join(base_dir, r"AdminPage\SidebarReportsPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Reports.tsx")
    ),
    "Admin / Dispatch Gateways & Incident Alerts": (
        os.path.join(base_dir, r"AdminPage\SidebarNotificationPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Notifications.tsx")
    ),
    "Admin / RBAC Roles & Privilege Matrix": (
        os.path.join(base_dir, r"AdminPage\SidebarRole&PermissionsPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\RolesPermissions.tsx")
    ),
    "Admin / Cryptographic Audit Logs & Hash Chain": (
        os.path.join(base_dir, r"AdminPage\SidebarAuditLogsPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\AuditLogs.tsx")
    ),
    "Admin / System Policies, DB & SMTP Settings": (
        os.path.join(base_dir, r"AdminPage\SidebarSettingsPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Settings.tsx")
    ),
    "Admin / Administrator Profile & Session Security": (
        os.path.join(base_dir, r"AdminPage\SidebarProfilePage\code.html"),
        os.path.join(base_dir, r"Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages\Profile.tsx")
    ),

    # Landing
    "Landing / Public Home, Showcase & Modals": (
        os.path.join(base_dir, r"LandingPage\code.html"),
        os.path.join(base_dir, r"Frontend\src\LANDING_PAGE\Features\Pages\Home\Home.tsx")
    )
}

detailed_report = {}

for name, (html_path, tsx_path) in pages_map.items():
    content = ""
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
            content += f.read()
            
    # Forms and inputs
    input_matches = re.findall(r'<(?:input|select|textarea)([^>]*)>', content, re.I)
    inputs_info = []
    for m in input_matches:
        t = re.search(r'type=[\'"]([^\'"]+)[\'"]', m)
        i = re.search(r'id=[\'"]([^\'"]+)[\'"]', m)
        p = re.search(r'placeholder=[\'"]([^\'"]+)[\'"]', m)
        type_str = t.group(1) if t else 'text'
        id_str = i.group(1) if i else None
        placeholder_str = p.group(1) if p else None
        if id_str or placeholder_str:
            inputs_info.append({
                'type': type_str,
                'id': id_str,
                'placeholder': placeholder_str
            })
            
    # Table headers
    th_matches = re.findall(r'<th[^>]*>(.*?)</th>', content, re.DOTALL | re.I)
    headers = []
    for th in th_matches:
        clean = re.sub(r'<[^>]+>', '', th).strip()
        clean = re.sub(r'\s+', ' ', clean)
        if clean and len(clean) < 40:
            headers.append(clean)
            
    # Button texts and action triggers
    btn_matches = re.findall(r'<button[^>]*>(.*?)</button>', content, re.DOTALL | re.I)
    buttons = []
    for b in btn_matches:
        clean = re.sub(r'<[^>]+>', '', b).strip()
        clean = re.sub(r'\s+', ' ', clean)
        if clean and len(clean) < 60:
            buttons.append(clean)
            
    # Modals
    modal_matches = re.findall(r'id=[\'"]([^\'"]*modal[^\'"]*)[\'"]', content, re.I)
    
    # Export / download buttons
    export_triggers = [b for b in buttons if any(w in b.lower() for w in ['export', 'download', 'csv', 'excel', 'marc', 'pdf', 'bibtex'])]
    
    # Filter pills / tabs
    filter_triggers = [b for b in buttons if any(w in b.lower() for w in ['all', 'filter', 'active', 'pending', 'due', 'overdue', 'weekly', 'monthly'])]
    
    detailed_report[name] = {
        'inputs': inputs_info,
        'table_headers': list(dict.fromkeys(headers)),
        'total_buttons': len(buttons),
        'unique_buttons': list(dict.fromkeys(buttons)),
        'export_actions': list(dict.fromkeys(export_triggers)),
        'filter_actions': list(dict.fromkeys(filter_triggers)),
        'modals': list(dict.fromkeys(modal_matches))
    }

with open(os.path.join(base_dir, r"scratch\deep_double_check.json"), "w", encoding="utf-8") as out:
    json.dump(detailed_report, out, indent=2)

print(f"Deep double check completed across {len(detailed_report)} sections!")
