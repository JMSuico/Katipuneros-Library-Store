import json

with open(r"scratch\crud_analysis.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for path, info in sorted(data.items()):
    if 'LANDING_PAGE' in path or 'CustomersPanel' in path:
        print("PAGE:", path)
        print("  Inputs:", info["inputs_id"])
        print("  Forms:", info["forms"])
        print("  Modals:", info["modals"])
        print("  Tables:", info["tables_or_containers"])
        print(f"  Buttons ({info['total_buttons']}):", info["buttons_sample"][:8])
        print()
