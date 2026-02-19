import os
import subprocess
from bs4 import BeautifulSoup
import json  # For JSON validation

# Function to setup local Babel if needed
def setup_babel():
    if not os.path.exists('node_modules/@babel/core'):
        print("Setting up local Babel...")
        subprocess.run(['npm', 'init', '-y'], check=True, capture_output=True)
        subprocess.run(['npm', 'install', '--save-dev', '@babel/core', '@babel/cli', '@babel/preset-env'], check=True, capture_output=True)
        
        # Create .babelrc if not exists
        babelrc_content = '''
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "defaults",
      "modules": false
    }]
  ]
}
'''
        with open('.babelrc', 'w') as f:
            f.write(babelrc_content)
        print("Babel setup complete.")

def is_json_ld(content):
    """Check if content is likely JSON-LD or any JSON object."""
    stripped = content.strip()
    if not (stripped.startswith('{') and stripped.endswith('}')):
        return False
    try:
        data = json.loads(stripped)
        return isinstance(data, dict) and ('@context' in data or '@type' in data)
    except json.JSONDecodeError:
        return False

def upgrade_js_to_es6(file_path):
    setup_babel()  # Ensure Babel is ready
    backup_path = file_path + '.bak'
    if not os.path.exists(backup_path):
        os.rename(file_path, backup_path)
    
    try:
        subprocess.run([
            'npx', 'babel', backup_path, '--out-file', file_path,
            '--presets=@babel/preset-env'
        ], check=True, capture_output=True)
        print(f"Upgraded JS: {file_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error upgrading JS {file_path}: {e.stderr.decode()}")
        # Restore backup if error
        os.rename(backup_path, file_path)

def upgrade_inline_js_in_html(file_path):
    setup_babel()  # Ensure Babel is ready
    backup_path = file_path + '.bak'
    if not os.path.exists(backup_path):
        os.rename(file_path, backup_path)
    
    with open(backup_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    updated = False
    for script in soup.find_all('script'):
        script_type = script.attrs.get('type', '').lower()
        if script_type in ['application/ld+json', 'application/json', 'text/ld+json', 'text/json'] or not script.string:
            continue  # Skip known JSON types or empty
        
        content = script.string.strip()
        if is_json_ld(content) or content.startswith('{') and ('@context' in content or '@type' in content):
            continue  # Skip detected JSON-LD
        
        # Additional heuristic: If it looks like JSON (starts with '{', no JS keywords), skip
        js_keywords = ['function', 'var ', 'let ', 'const ', 'return', 'if ', 'for ', 'while ', 'class ', 'import ', 'export ']
        if content.startswith('{') and not any(keyword in content for keyword in js_keywords):
            continue
        
        # Process only likely JS
        temp_js = 'temp.js'
        with open(temp_js, 'w', encoding='utf-8') as f:
            f.write(content)
        try:
            subprocess.run(['npx', 'babel', temp_js, '--out-file', temp_js, '--presets=@babel/preset-env'], check=True)
            with open(temp_js, 'r', encoding='utf-8') as f:
                upgraded_js = f.read()
            script.string.replace_with(upgraded_js)
            updated = True
        except subprocess.CalledProcessError as e:
            print(f"Error upgrading inline JS in {file_path}: {e.stderr.decode()}")
        finally:
            if os.path.exists(temp_js):
                os.remove(temp_js)
    
    if updated:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        print(f"Upgraded inline JS in: {file_path}")
    else:
        # Restore if no update (optional, but safe)
        os.rename(backup_path, file_path)

# Main batch processing for JS and inline JS
directory = '.'

for root, _, files in os.walk(directory):
    if '.venv' in root or 'site-packages' in root or 'node_modules' in root:
        continue
    for file in files:
        full_path = os.path.join(root, file)
        if file.endswith('.html'):
            upgrade_inline_js_in_html(full_path)
        elif file.endswith('.js'):
            upgrade_js_to_es6(full_path)