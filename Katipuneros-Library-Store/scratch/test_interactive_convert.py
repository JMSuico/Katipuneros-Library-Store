import os
import re

html_file = r'C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\AdminPage\SidebarAuditLogsPage\code.html'
with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Find scripts
scripts = re.findall(r'<script\b[^>]*>(.*?)</script>', content, re.DOTALL | re.IGNORECASE)
page_scripts = [s.strip() for s in scripts if s.strip() and not 'tailwind.config' in s and not 'import' in s]

print(f"Found {len(page_scripts)} page scripts:")
for s in page_scripts:
    print("--- SCRIPT START ---")
    print(s[:300])
    print("--- SCRIPT END ---")
