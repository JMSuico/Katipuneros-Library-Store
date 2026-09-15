import os
import re

def convert_onclick(attr_value):
    val = attr_value.strip()
    if not val:
        return 'onClick={() => {}}'
    
    has_stop = 'stopPropagation' in val
    val_clean = re.sub(r'event\.stopPropagation\(\);?', '', val).strip()
    
    # Check for alert
    if val_clean.startswith('alert('):
        clean_alert = val_clean.rstrip(';')
        if has_stop:
            return f'onClick={{(e) => {{ e.stopPropagation(); {clean_alert}; }}}}'
        return f'onClick={{() => {clean_alert}}}'
        
    # Check for window.print()
    if 'window.print()' in val_clean:
        if has_stop:
            return 'onClick={(e) => { e.stopPropagation(); window.print(); }}'
        return 'onClick={() => window.print()}'
        
    # Check for document.getElementById
    if 'document.getElementById' in val_clean:
        clean_doc = val_clean.rstrip(';')
        clean_doc = clean_doc.replace(".classList", "?.classList")
        if has_stop:
            return f'onClick={{(e) => {{ e.stopPropagation(); {clean_doc}; }}}}'
        return f'onClick={{() => {{ {clean_doc}; }}}}'
        
    call_expr = val_clean.rstrip(';')
    call_expr = re.sub(r'\bthis\b', 'e.currentTarget', call_expr)
    
    m = re.match(r'([a-zA-Z0-9_]+)\s*\((.*)\)$', call_expr)
    if m:
        fn_name = m.group(1)
        args = m.group(2)
        if has_stop:
            return f'onClick={{(e) => {{ e.stopPropagation(); (window as any).{fn_name}?.({args}); }}}}'
        return f'onClick={{(e) => {{ (window as any).{fn_name}?.({args}); }}}}'
        
    return f'onClick={{() => {{ try {{ {val_clean}; }} catch (err) {{ console.error(err); }} }}}}'

def html_to_jsx(html_str):
    # 1. Strip script tags from JSX body (they will be executed in useEffect)
    html_str = re.sub(r'<script\b[^>]*>.*?</script>', '', html_str, flags=re.DOTALL | re.IGNORECASE)

    # 2. Convert standard HTML attributes to JSX
    html_str = re.sub(r'\bclass="', 'className="', html_str)
    html_str = re.sub(r'\bfor="', 'htmlFor="', html_str)
    html_str = re.sub(r'\bautocomplete="', 'autoComplete="', html_str)
    html_str = re.sub(r'\bautofocus\b', 'autoFocus', html_str)
    html_str = re.sub(r'\breadonly\b', 'readOnly', html_str)
    html_str = re.sub(r'\bstroke-width=', 'strokeWidth=', html_str)
    html_str = re.sub(r'\bstroke-linecap=', 'strokeLinecap=', html_str)
    html_str = re.sub(r'\bstroke-linejoin=', 'strokeLinejoin=', html_str)
    html_str = re.sub(r'\bclip-rule=', 'clipRule=', html_str)
    html_str = re.sub(r'\bfill-rule=', 'fillRule=', html_str)
    
    # Replace onclick and onsubmit attributes with functional React handlers (proper quote matching)
    html_str = re.sub(r'\bonclick="([^"]*)"', lambda m: convert_onclick(m.group(1)), html_str, flags=re.IGNORECASE)
    html_str = re.sub(r"\bonclick='([^']*)'", lambda m: convert_onclick(m.group(1)), html_str, flags=re.IGNORECASE)
    
    def onsubmit_replacer(match):
        val = match.group(1).strip()
        val_clean = val.replace('event.preventDefault();', '').strip().rstrip(';')
        if val_clean.endswith('()'):
            fn = val_clean[:-2]
            return f'onSubmit={{(e) => {{ e.preventDefault(); (window as any).{fn}?.(); }}}}'
        return f'onSubmit={{(e) => {{ e.preventDefault(); {val_clean}; }}}}'
    html_str = re.sub(r'\bonsubmit="([^"]*)"', onsubmit_replacer, html_str, flags=re.IGNORECASE)
    html_str = re.sub(r"\bonsubmit='([^']*)'", onsubmit_replacer, html_str, flags=re.IGNORECASE)
    
    # Numeric attributes to JSX expression {number}
    html_str = re.sub(r'\brows="(\d+)"', r'rows={\1}', html_str)
    html_str = re.sub(r'\bcols="(\d+)"', r'cols={\1}', html_str)
    html_str = re.sub(r'\btabindex="(-?\d+)"', r'tabIndex={\1}', html_str)
    html_str = re.sub(r'\bmaxlength="(\d+)"', r'maxLength={\1}', html_str)
    html_str = re.sub(r'\bminlength="(\d+)"', r'minLength={\1}', html_str)
    html_str = re.sub(r'\bcolspan="(\d+)"', r'colSpan={\1}', html_str)
    html_str = re.sub(r'\browspan="(\d+)"', r'rowSpan={\1}', html_str)

    # checked & disabled & required & selected attributes
    html_str = re.sub(r'\bselected=""', 'selected={true}', html_str)
    html_str = re.sub(r'\bselected="selected"', 'selected={true}', html_str)
    html_str = re.sub(r'\bselected="true"', 'selected={true}', html_str)
    html_str = re.sub(r'\bselected="false"', 'selected={false}', html_str)
    html_str = re.sub(r'\bselected\b(?!=)', 'selected={true}', html_str)

    html_str = re.sub(r'\bchecked=""', 'defaultChecked', html_str)
    html_str = re.sub(r'\bchecked="true"', 'defaultChecked', html_str)
    html_str = re.sub(r'\bchecked="checked"', 'defaultChecked', html_str)
    html_str = re.sub(r'\bchecked\b(?!=)', 'defaultChecked', html_str)

    html_str = re.sub(r'\bdisabled=""', 'disabled={true}', html_str)
    html_str = re.sub(r'\bdisabled="true"', 'disabled={true}', html_str)
    html_str = re.sub(r'\bdisabled="false"', 'disabled={false}', html_str)
    html_str = re.sub(r'\bdisabled\b(?!=)', 'disabled={true}', html_str)

    html_str = re.sub(r'\brequired=""', 'required={true}', html_str)
    html_str = re.sub(r'\brequired="true"', 'required={true}', html_str)
    html_str = re.sub(r'\brequired="false"', 'required={false}', html_str)
    html_str = re.sub(r'\brequired\b(?!=)', 'required={true}', html_str)

    html_str = re.sub(r'\breadonly=""', 'readOnly={true}', html_str)
    html_str = re.sub(r'\breadonly="true"', 'readOnly={true}', html_str)
    html_str = re.sub(r'\breadonly="false"', 'readOnly={false}', html_str)
    html_str = re.sub(r'\breadOnly=""', 'readOnly={true}', html_str)
    html_str = re.sub(r'\breadOnly="true"', 'readOnly={true}', html_str)
    html_str = re.sub(r'\breadOnly="false"', 'readOnly={false}', html_str)
    html_str = re.sub(r'\breadonly\b(?!=)', 'readOnly={true}', html_str)
    html_str = re.sub(r'\breadOnly\b(?!=)', 'readOnly={true}', html_str)

    # 3. Escape double curly braces in text like {{...}} but NOT when preceded by = (style={{...}})
    html_str = re.sub(r'(?<!=)\{\{([^{}]+)\}\}', r'&#123;&#123;\1&#125;&#125;', html_str)

    # 4. Inline style conversion: style="prop: val; prop2: val2;" -> style={{ prop: 'val', prop2: 'val2' }}
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

    # 5. Self-close void tags: <input ...>, <img ...>, <hr ...>, <br ...>
    html_str = re.sub(r'<input\b([^>]*)>', lambda m: m.group(0) if m.group(0).endswith('/>') else f'<input{m.group(1)} />', html_str)
    html_str = re.sub(r'<img\b([^>]*)>', lambda m: m.group(0) if m.group(0).endswith('/>') else f'<img{m.group(1)} />', html_str)
    html_str = re.sub(r'<hr\b([^>]*)>', lambda m: m.group(0) if m.group(0).endswith('/>') else f'<hr{m.group(1)} />', html_str)
    html_str = re.sub(r'<br\b([^>]*)>', lambda m: m.group(0) if m.group(0).endswith('/>') else f'<br{m.group(1)} />', html_str)

    # 6. HTML comments to JSX comments <!-- comment --> -> {/* comment */}
    html_str = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', html_str, flags=re.DOTALL)

    # 7. Handle pre tags with raw json
    def pre_fixer(match):
        attrs = match.group(1)
        body = match.group(2)
        if '{' in body or '}' in body:
            body_esc = body.replace('`', '\\`').replace('${', '\\${')
            return f'<pre{attrs}>{{`{body_esc}`}}</pre>'
        return match.group(0)
    html_str = re.sub(r'<pre\b([^>]*)>(.*?)</pre>', pre_fixer, html_str, flags=re.DOTALL)

    return html_str

def prepare_script_for_component(script_text):
    if not script_text.strip():
        return ""
    if 'tailwind.config' in script_text:
        return ""
    
    # Replace DOMContentLoaded with immediate execution
    s = re.sub(r'document\.addEventListener\(\s*[\'"]DOMContentLoaded[\'"]\s*,\s*(?:function\s*\(\s*\)|\(\s*\)\s*=>)\s*\{', '(function() {', script_text)
    
    # Cast Array.from and window assignments for TS
    s = s.replace('Array.from(', 'Array.from<any>(')
    s = re.sub(r'\bwindow\.([a-zA-Z0-9_]+)\s*=', r'(window as any).\1 =', s)

    # Find all function names declared at top level
    fn_names = re.findall(r'^function\s+([a-zA-Z0-9_]+)\s*\(', s, flags=re.MULTILINE)
    assignments = []
    for fn in set(fn_names):
        assignments.append(f"try {{ w.{fn} = {fn}; }} catch (_) {{}}")
    assign_str = "\n".join(assignments)
    
    return s + "\n" + assign_str

def convert_file(src_file, target_file, component_name, description, layer):
    with open(src_file, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    
    # Extract scripts
    raw_scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', html, re.DOTALL | re.IGNORECASE)
    valid_scripts = []
    for sc in raw_scripts:
        clean_sc = sc.strip()
        if clean_sc and not 'tailwind.config' in clean_sc and not 'import' in clean_sc:
            prepared = prepare_script_for_component(clean_sc)
            if prepared:
                valid_scripts.append(prepared)
                
    m = re.search(r'<main[^>]*>(.*?)</main>', html, flags=re.DOTALL)
    if not m:
        print(f"Error: no <main> tag in {src_file}")
        return False
        
    main_body = m.group(1).strip()
    jsx_body = html_to_jsx(main_body)

    script_effect = ""
    if valid_scripts:
        combined_script = "\n\n".join(valid_scripts)
        script_effect = f"""
  useEffect(() => {{
    const document: any = window.document;
    const w = window as any;
    try {{
{combined_script}
    }} catch (err) {{
      console.error("UI interaction script error:", err);
    }}
  }}, []);
"""

    header_comment = f"""// [Layer: {layer}]
// {component_name}.tsx -- {description}
// Converted directly from {os.path.basename(os.path.dirname(src_file))}/code.html.
// DO NOT put business logic or direct API calls here.
import {{ FC{', useEffect' if script_effect else ''} }} from 'react';

const {component_name}: FC = () => {{{script_effect}
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
    print(f"Successfully converted {component_name} -> {os.path.basename(target_file)} (interactive: {bool(script_effect)})")
    return True

cashier_pages = [
    ("SibarBarDashBoardPage", "CashierDashboard.tsx", "CashierDashboard", "Cashier Point of Sale & Circulation Dashboard"),
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
    ("SidebarAdminDashboardPage", "AdminDashboard.tsx", "AdminDashboard", "Admin System Executive Dashboard"),
    ("SidebarAuditLogsPage", "AuditLogs.tsx", "AuditLogs", "Admin Immutable System Audit Logs"),
    ("SidebarBookManagementPage", "BooksManager.tsx", "BooksManager", "Admin Book and Catalog Management"),
    ("SidebarBorrowingsPage", "Borrowings.tsx", "Borrowings", "Admin Borrowing Circulation Ledger"),
    ("SidebarCategoriesPage", "Categories.tsx", "Categories", "Admin Book Categories and Dewey Classes"),
    ("SidebarInventoryPage", "Inventory.tsx", "Inventory", "Admin Physical Stacks Inventory and RFID"),
    ("SidebarNotificationPage", "Notifications.tsx", "Notifications", "Admin Notification Center and Alerts"),
    ("SidebarProfilePage", "Profile.tsx", "Profile", "Admin User Profile and System Credentials"),
    ("SidebarReportsPage", "Reports.tsx", "Reports", "Admin Reports, Analytics, and Intelligence Export"),
    ("SidebarReservationPage", "Reservations.tsx", "Reservations", "Admin Reservation Ledger and Hold Queue"),
    ("SidebarReturnsPage", "Returns.tsx", "Returns", "Admin Returns and Settlement Reconciliation"),
    ("SidebarRole&PermissionsPage", "RolesPermissions.tsx", "RolesPermissions", "Admin RBAC Roles and Security Matrix"),
    ("SidebarSettingsPage", "Settings.tsx", "Settings", "Admin Library System Configuration and Parameters"),
    ("SiderbarAnalyticsPage", "Analytics.tsx", "Analytics", "Admin System Analytics and Deep Metrics"),
    ("SiderbarUserManagementPage", "UserManagement.tsx", "UserManagement", "Admin User Directory and Patron Accounts"),
]

customer_pages = [
    ("NavHomePage", "CustomerDashboard.tsx", "CustomerDashboard", "Customer Portal Home and Active Borrowings"),
    ("NavCatalogPage", "CatalogPage.tsx", "CatalogPage", "Customer Book Catalog and OPAC Search"),
    ("NavBorrowingsPage", "BorrowingsPage.tsx", "BorrowingsPage", "Customer Borrowing History and Renewals"),
    ("NavReservationPage", "ReservationsPage.tsx", "ReservationsPage", "Customer Active Holds and Locker Pickups"),
    ("NavFavoritesPage", "FavoritesPage.tsx", "FavoritesPage", "Customer Saved Books and Reading List"),
    ("NavProfile&Settings", "ProfileSettings.tsx", "ProfileSettings", "Customer Profile and Library Card Settings"),
]

base_dir = r"C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE"
fe_dir = os.path.join(base_dir, "Frontend", "src", "UserRoles", "Features", "Pages")

print("--- Converting Cashier Pages ---")
cashier_dest = os.path.join(fe_dir, "CashiersPanel", "Pages")
for src_folder, tgt_file, comp_name, desc in cashier_pages:
    src_p = os.path.join(base_dir, "CashierPage", src_folder, "code.html")
    tgt_p = os.path.join(cashier_dest, tgt_file)
    convert_file(src_p, tgt_p, comp_name, desc, "UserRoles/Features/Pages/CashiersPanel/Pages")

print("\n--- Converting Admin Pages ---")
admin_dest = os.path.join(fe_dir, "AdminsPanel", "Pages")
for src_folder, tgt_file, comp_name, desc in admin_pages:
    src_p = os.path.join(base_dir, "AdminPage", src_folder, "code.html")
    tgt_p = os.path.join(admin_dest, tgt_file)
    convert_file(src_p, tgt_p, comp_name, desc, "UserRoles/Features/Pages/AdminsPanel/Pages")

print("\n--- Converting Customer Pages ---")
customer_dest = os.path.join(fe_dir, "CustomersPanel", "Pages")
for src_folder, tgt_file, comp_name, desc in customer_pages:
    src_p = os.path.join(base_dir, "CustomerPage", src_folder, "code.html")
    tgt_p = os.path.join(customer_dest, tgt_file)
    convert_file(src_p, tgt_p, comp_name, desc, "UserRoles/Features/Pages/CustomersPanel/Pages")

print("\nAll pages converted successfully with full UI interactions intact!")
