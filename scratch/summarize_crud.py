import json

with open(r"c:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\scratch\crud_analysis.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Group by Portal
groups = {
    'LANDING_PAGE': {},
    'CustomersPanel': {},
    'CashiersPanel': {},
    'AdminsPanel': {}
}

for k, v in data.items():
    for g in groups:
        if g in k:
            groups[g][k] = v

for g, items in groups.items():
    print(f"\n=================== {g} ({len(items)} files) ===================")
    for path, info in sorted(items.items()):
        if 'Pages/' in path or 'Home.tsx' in path or 'Services.tsx' in path or 'Product.tsx' in path or 'ContactMe.tsx' in path:
            print(f"\nPAGE: {path}")
            print(f"  Inputs ({len(info['inputs_id'])}): {info['inputs_id']}")
            print(f"  Forms ({len(info['forms'])}): {info['forms']}")
            print(f"  Modals ({len(info['modals'])}): {info['modals']}")
            print(f"  Tables/Grids: {info['tables_or_containers']}")
            print(f"  Buttons sample ({info['total_buttons']} total): {info['buttons_sample'][:8]}")
