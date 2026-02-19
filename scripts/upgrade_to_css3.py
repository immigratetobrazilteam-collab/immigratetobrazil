import os
import logging
import cssutils

# Suppress all cssutils logs below CRITICAL
logging.getLogger('cssutils').setLevel(logging.CRITICAL)
cssutils.log.setLevel(logging.CRITICAL)

def upgrade_css_to_css3(file_path):
    # Backup original
    backup_path = file_path + '.bak'
    if not os.path.exists(backup_path):
        os.rename(file_path, backup_path)
    
    # Read file in binary to handle potential encoding issues
    with open(backup_path, 'rb') as f:
        content = f.read()
    
    # Decode with UTF-8, ignoring errors
    try:
        css_text = content.decode('utf-8')
    except UnicodeDecodeError:
        css_text = content.decode('utf-8', errors='ignore')
    
    # Parse without validation
    sheet = cssutils.parseString(css_text, validate=False)
    
    # Optional custom upgrades: Replace deprecated properties
    for rule in sheet:
        if rule.type == rule.STYLE_RULE:
            style = rule.style
            # Example: Replace old 'filter' with 'opacity'
            if 'filter' in style:
                if 'alpha(opacity' in style['filter']:
                    opacity_value = style['filter'].split('=')[1].strip(')')
                    style['opacity'] = str(int(opacity_value) / 100)
                    style.removeProperty('filter')
            # Add more replacements, e.g., for '-moz-border-radius' -> 'border-radius'
    
    # Serialize back as cleaned CSS3-compliant text
    css_text_output = sheet.cssText
    upgraded_content = css_text_output.encode('utf-8') if isinstance(css_text_output, str) else css_text_output
    
    with open(file_path, 'wb') as f:
        f.write(upgraded_content)
    
    print(f"Upgraded: {file_path}")

# Directory containing your CSS files (change if needed)
directory = '.'  # Or '/path/to/css/folder'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.css'):
            upgrade_css_to_css3(os.path.join(root, file))