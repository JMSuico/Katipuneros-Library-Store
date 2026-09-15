import re

with open(r'C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\Frontend\src\UserRoles\Features\Pages\CustomersPanel\Pages\FavoritesPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
for i, line in enumerate(lines):
    # check quotes
    q = line.count('"')
    if q % 2 != 0:
        print(f"Line {i+1} has odd double quotes ({q}): {line}")
    sq = line.count("'")
    # check for onclick
    if 'onClick' in line:
        print(f"Line {i+1} onClick: {line}")
