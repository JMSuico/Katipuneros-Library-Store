import os
import re
import json

frontend_dir = r"c:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\Frontend\src"
backend_dir = r"c:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\Backend"

def analyze_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # buttons
    buttons = re.findall(r'<button[^>]*>(.*?)</button>', content, re.DOTALL)
    clean_buttons = []
    for b in buttons:
        text = re.sub(r'<[^>]+>', '', b).strip()
        text = re.sub(r'\s+', ' ', text)
        if text and len(text) < 80:
            clean_buttons.append(text)
            
    # inputs and form fields
    inputs = re.findall(r'<(?:input|select|textarea)[^>]*id=[\'"]([^\'"]+)[\'"]', content)
    input_names = re.findall(r'<(?:input|select|textarea)[^>]*name=[\'"]([^\'"]+)[\'"]', content)
    placeholders = re.findall(r'placeholder=[\'"]([^\'"]+)[\'"]', content)
    
    # forms
    forms = re.findall(r'<form[^>]*id=[\'"]([^\'"]+)[\'"]', content)
    
    # modals
    modals = re.findall(r'id=[\'"]([^\'"]*modal[^\'"]*)[\'"]', content, re.I)
    
    # tables
    tables = re.findall(r'id=[\'"]([^\'"]*(?:table|list|grid)[^\'"]*)[\'"]', content, re.I)

    # onclick handlers
    onclicks = re.findall(r'onClick=\{[^\}]*\}', content)
    
    return {
        'buttons_sample': list(dict.fromkeys(clean_buttons))[:25],
        'inputs_id': list(dict.fromkeys(inputs)),
        'input_names': list(dict.fromkeys(input_names)),
        'placeholders': list(dict.fromkeys(placeholders))[:15],
        'forms': forms,
        'modals': list(dict.fromkeys(modals)),
        'tables_or_containers': list(dict.fromkeys(tables))[:10],
        'total_buttons': len(buttons),
        'total_inputs': len(inputs) + len(placeholders),
    }

results = {}
for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.tsx') and ('Pages' in root or 'LANDING_PAGE' in root):
            rel = os.path.relpath(os.path.join(root, file), frontend_dir).replace('\\', '/')
            results[rel] = analyze_file(os.path.join(root, file))

with open(r"c:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\scratch\crud_analysis.json", "w", encoding="utf-8") as out:
    json.dump(results, out, indent=2)

print("Scan complete! Found", len(results), "pages/components.")
