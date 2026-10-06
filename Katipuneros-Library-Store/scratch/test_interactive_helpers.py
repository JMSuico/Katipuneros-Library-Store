import os
import re

def process_script_for_react(script_text):
    # Remove tailwind config if any
    if 'tailwind.config' in script_text:
        return ''
    # If script contains DOMContentLoaded, we can replace it to run immediately
    script_text = re.sub(r'document\.addEventListener\(\s*[\'"]DOMContentLoaded[\'"]\s*,\s*(?:function\s*\(\s*\)|\(\s*\)\s*=>)\s*\{', '(function() {', script_text)
    
    # Expose named top-level functions on window (window as any)
    # e.g. function openInspector(index) -> const openInspector = (window as any).openInspector = function(index)
    def fn_replacer(m):
        fn_name = m.group(1)
        args = m.group(2)
        return f'const {fn_name} = (w.{fn_name} = function({args})'

    # Match: function foo(...)
    script_text = re.sub(r'\bfunction\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)', fn_replacer, script_text)
    
    return script_text

def convert_onclick(attr_value):
    val = attr_value.strip()
    if not val:
        return 'onClick={() => {}}'
    
    # Check for event.stopPropagation()
    has_stop = 'stopPropagation' in val
    val_clean = re.sub(r'event\.stopPropagation\(\);?', '', val).strip()
    
    # Check for alert
    if val_clean.startswith('alert('):
        if has_stop:
            return f'onClick={{(e) => {{ e.stopPropagation(); {val_clean}; }}}}'
        return f'onClick={{() => {val_clean}}}'
        
    # Check for window.print()
    if 'window.print()' in val_clean:
        if has_stop:
            return 'onClick={(e) => { e.stopPropagation(); window.print(); }}'
        return 'onClick={() => window.print()}'
        
    # Check for document.getElementById
    if 'document.getElementById' in val_clean:
        if has_stop:
            return f'onClick={{(e) => {{ e.stopPropagation(); {val_clean}; }}}}'
        return f'onClick={{() => {{ {val_clean}; }}}}'
        
    # Function calls like openInspector(0), toggleDrawer(true), switchTab(this, 'all')
    # Replace 'this' with 'e.currentTarget'
    call_expr = val_clean
    call_expr = re.sub(r'\bthis\b', 'e.currentTarget', call_expr)
    
    # Extract function name
    m = re.match(r'([a-zA-Z0-9_]+)\s*\((.*)\)', call_expr)
    if m:
        fn_name = m.group(1)
        args = m.group(2)
        if has_stop:
            return f'onClick={{(e) => {{ e.stopPropagation(); (window as any).{fn_name}?.({args}); }}}}'
        return f'onClick={{(e) => (window as any).{fn_name}?.({args})}}'
        
    return f'onClick={{() => {{ try {{ {val_clean}; }} catch (err) {{ console.error(err); }} }}}}'

print("Converter helper ready.")
