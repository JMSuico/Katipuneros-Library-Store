import re
import os
import glob

def html_to_jsx(html_str):
    # Strip any <script>...</script> tags from inside HTML
    html_str = re.sub(r'<script[^>]*>.*?</script>', '', html_str, flags=re.DOTALL)

    # 1. HTML comments to JSX comments
    def comment_replacer(match):
        comment_body = match.group(1).replace('*/', '* /')
        return '{/*' + comment_body + '*/}'
    html_str = re.sub(r'<!--(.*?)-->', comment_replacer, html_str, flags=re.DOTALL)
    
    # 2. Attributes
    html_str = re.sub(r'\bclass=', 'className=', html_str)
    html_str = re.sub(r'\bfor="', 'htmlFor="', html_str)
    html_str = re.sub(r'\bautocomplete=', 'autoComplete=', html_str)
    html_str = re.sub(r'\bautofocus\b', 'autoFocus', html_str)
    html_str = re.sub(r'\breadonly\b', 'readOnly', html_str)
    html_str = re.sub(r'\bstroke-width=', 'strokeWidth=', html_str)
    html_str = re.sub(r'\bstroke-linecap=', 'strokeLinecap=', html_str)
    html_str = re.sub(r'\bstroke-linejoin=', 'strokeLinejoin=', html_str)
    html_str = re.sub(r'\bclip-rule=', 'clipRule=', html_str)
    html_str = re.sub(r'\bfill-rule=', 'fillRule=', html_str)
    html_str = re.sub(r'\bonclick="[^"]*"', 'onClick={() => {}}', html_str)
    
    # Numeric attributes to JSX expression {number}
    html_str = re.sub(r'\brows="(\d+)"', r'rows={\1}', html_str)
    html_str = re.sub(r'\bcols="(\d+)"', r'cols={\1}', html_str)
    html_str = re.sub(r'\btabindex="(-?\d+)"', r'tabIndex={\1}', html_str)
    html_str = re.sub(r'\bmaxlength="(\d+)"', r'maxLength={\1}', html_str)
    html_str = re.sub(r'\bminlength="(\d+)"', r'minLength={\1}', html_str)
    html_str = re.sub(r'\bcolspan="(\d+)"', r'colSpan={\1}', html_str)
    html_str = re.sub(r'\browspan="(\d+)"', r'rowSpan={\1}', html_str)

    # checked attribute
    html_str = re.sub(r'\bchecked=""', 'defaultChecked', html_str)
    html_str = re.sub(r'\bchecked\b(?!=)', 'defaultChecked', html_str)

    # 3. Inline style conversion: style="prop: val; prop2: val2;" -> style={{ prop: 'val', prop2: 'val2' }}
    def style_replacer(match):
        style_content = match.group(1).strip()
        if not style_content:
            return ''
        pairs = [p.strip() for p in style_content.split(';') if p.strip()]
        js_pairs = []
        for pair in pairs:
            if ':' in pair:
                k, v = pair.split(':', 1)
                k = k.strip()
                v = v.strip()
                parts = k.split('-')
                camel_k = parts[0] + ''.join(x.capitalize() for x in parts[1:])
                v = v.replace("'", "\\'")
                js_pairs.append(f"{camel_k}: '{v}'")
        return f"style={{{{ {', '.join(js_pairs)} }}}}"

    html_str = re.sub(r'style="([^"]*)"', style_replacer, html_str)

    # 4. Wrap JSON content in <pre> tags with template literal
    def pre_replacer(match):
        attrs = match.group(1)
        content = match.group(2)
        # escape backticks in content
        content = content.replace('`', '\\`').replace('$', '\\$')
        return f"<pre{attrs}>{{`{content}`}}</pre>"

    html_str = re.sub(r'<pre([^>]*)>([\s\S]*?)</pre>', pre_replacer, html_str)

    # 5. Self-closing tags: input, img, hr, br
    html_str = re.sub(r'(<(?:input|img|hr|br)[^>]*?)(?<!/)>', r'\1 />', html_str)

    return html_str

def convert_page(src_file, target_file, component_name, layer, description):
    with open(src_file, 'r', encoding='utf-8') as f:
        html = f.read()

    m = re.search(r'<main[^>]*>(.*?)</main>', html, flags=re.DOTALL)
    if not m:
        print(f"Error: no <main> tag in {src_file}")
        return False
        
    main_body = m.group(1).strip()
    jsx_body = html_to_jsx(main_body)

    header_comment = f"""// [Layer: {layer}]
// {component_name}.tsx -- {description}
// Converted directly from {os.path.basename(os.path.dirname(src_file))}/code.html.
// DO NOT put business logic or direct API calls here.
import {{ FC }} from 'react';

const {component_name}: FC = () => {{
  return (
    <div className="w-full">
      {jsx_body}
    </div>
  );
}};

export default {component_name};
"""
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(header_comment)
    print(f"Successfully converted {component_name} -> {os.path.basename(target_file)}")
    return True

cashier_pages = [
    ("SidebarPendingReservationPage", "PendingReservations.tsx", "PendingReservations", "Cashier Pending Reservations Queue"),
    ("SideBarCheckoutBorrowPage", "CheckoutBorrow.tsx", "CheckoutBorrow", "Cashier Checkout and Borrowing Desk"),
    ("SidebarReturn&FinesPage", "ReturnsFines.tsx", "ReturnsFines", "Cashier Returns and Fine Settlement"),
    ("SidebarCustomerLookupPage", "CustomerLookup.tsx", "CustomerLookup", "Cashier Customer Lookup and Verification"),
    ("SidebarBookAvailabilityPage", "BookAvailability.tsx", "BookAvailability", "Cashier Book Availability and Stack Catalog"),
    ("SidebarSchedulesPage", "Schedules.tsx", "Schedules", "Cashier Library Schedules and Desk Shifts"),
    ("SidebarOverdueandFinesPage", "OverdueFines.tsx", "OverdueFines", "Cashier Overdue Loans and Penalties Ledger"),
    ("SidebarTransactionPage", "Transactions.tsx", "Transactions", "Cashier Transaction History and Audit Ledger"),
    ("SidebarNotificationsPage", "Notifications.tsx", "Notifications", "Cashier Operations Notifications and Alerts"),
]

admin_pages = [
    ("SidebarAdminDashboardPage", "AdminDashboard.tsx", "AdminDashboard", "Admin Master Management Dashboard"),
    ("SiderbarUserManagementPage", "UserManagement.tsx", "UserManagement", "Admin User Account Management"),
    ("SidebarBookManagementPage", "BooksManager.tsx", "BooksManager", "Admin Book Catalog and Stacks Manager"),
    ("SidebarReservationPage", "Reservations.tsx", "Reservations", "Admin Reservation Queue and Approvals"),
    ("SidebarBorrowingsPage", "Borrowings.tsx", "Borrowings", "Admin Circulation and Active Borrowings"),
    ("SidebarReturnsPage", "Returns.tsx", "Returns", "Admin Return Verification and Damage Log"),
    ("SidebarInventoryPage", "Inventory.tsx", "Inventory", "Admin Physical Stacks Inventory Audit"),
    ("SiderbarAnalyticsPage", "Analytics.tsx", "Analytics", "Admin Library Analytics and Performance Metrics"),
    ("SidebarCategoriesPage", "Categories.tsx", "Categories", "Admin Book Categories and Dewey Decimal System"),
    ("SidebarReportsPage", "Reports.tsx", "Reports", "Admin Intelligence Reports and Aggregates"),
    ("SidebarNotificationPage", "Notifications.tsx", "Notifications", "Admin Global Notification Dispatcher"),
    ("SidebarRole&PermissionsPage", "RolesPermissions.tsx", "RolesPermissions", "Admin Role-Based Access Control (RBAC)"),
    ("SidebarAuditLogsPage", "AuditLogs.tsx", "AuditLogs", "Admin System-wide Security Audit Trail"),
    ("SidebarSettingsPage", "Settings.tsx", "Settings", "Admin System Configuration and Global Policies"),
    ("SidebarProfilePage", "Profile.tsx", "Profile", "Admin Personal Profile and Access Credentials"),
]

def main():
    cashier_base = r"C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\CashierPage"
    cashier_target = r"C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\Frontend\src\UserRoles\Features\Pages\CashiersPanel\Pages"

    admin_base = r"C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\AdminPage"
    admin_target = r"C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\Frontend\src\UserRoles\Features\Pages\AdminsPanel\Pages"

    print("--- Converting Cashier Pages ---")
    for folder, out_name, comp, desc in cashier_pages:
        src = os.path.join(cashier_base, folder, "code.html")
        tgt = os.path.join(cashier_target, out_name)
        convert_page(src, tgt, comp, "UserRoles/Features/Pages/CashiersPanel/Pages", desc)

    print("\n--- Converting Admin Pages ---")
    for folder, out_name, comp, desc in admin_pages:
        src = os.path.join(admin_base, folder, "code.html")
        tgt = os.path.join(admin_target, out_name)
        convert_page(src, tgt, comp, "UserRoles/Features/Pages/AdminsPanel/Pages", desc)

if __name__ == '__main__':
    main()
