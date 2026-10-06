import os
import re

base = r'C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE'
dirs = ['AdminPage', 'CashierPage', 'LandingPage', 'CustomerPage']

for d in dirs:
    dp = os.path.join(base, d)
    for root, subdirs, files in os.walk(dp):
        for f in files:
            if f.endswith('.html'):
                fp = os.path.join(root, f)
                with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                    c = fh.read()
                matches = re.findall(r'onclick=["\']([^"\']+)["\']', c, re.IGNORECASE)
                if matches:
                    unique_matches = list(set(matches))
                    print(f'{os.path.basename(os.path.dirname(fp))}: {len(matches)} onclick attributes -> {unique_matches[:5]}')
