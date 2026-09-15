import os
import re

base = r'C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE'
dirs = ['AdminPage', 'CashierPage', 'LandingPage', 'CustomerPage']

for d in dirs:
    dp = os.path.join(base, d)
    for root, subdirs, files in os.walk(dp):
        for f in files:
            if f.endswith('.html') and not 'TreeJSAssets' in root:
                fp = os.path.join(root, f)
                with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                    c = fh.read()
                scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', c, re.DOTALL | re.IGNORECASE)
                non_empty = [s.strip() for s in scripts if s.strip() and not 'tailwind.config' in s and not 'import' in s]
                if non_empty:
                    name = os.path.basename(os.path.dirname(fp))
                    print(f"=== {name} ({len(non_empty)} scripts) ===")
                    for idx, sc in enumerate(non_empty):
                        first_line = sc.split('\n')[0].strip()
                        print(f"  [{idx+1}] {first_line[:80]} (len {len(sc)})")
