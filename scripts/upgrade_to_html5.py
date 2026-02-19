import os
from bs4 import BeautifulSoup

def upgrade_html_to_html5(file_path):
    # Backup original file
    backup_path = file_path + '.bak'
    if not os.path.exists(backup_path):
        os.rename(file_path, backup_path)
    
    with open(backup_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse with html5lib to enforce HTML5 standards
    soup = BeautifulSoup(content, 'html5lib')
    
    # Optional: Replace deprecated elements (add more as needed)
    for tag in soup.find_all('center'):
        tag.name = 'div'
        tag['style'] = 'text-align: center;'
    
    for tag in soup.find_all('font'):
        # Convert font attributes to inline style
        style = ''
        if tag.has_attr('color'):
            style += f"color: {tag['color']}; "
        if tag.has_attr('size'):
            style += f"font-size: {tag['size']}pt; "
        tag.name = 'span'
        if style:
            tag['style'] = style.strip()
    
    # Output as string (BeautifulSoup adds <!DOCTYPE html> automatically with html5lib)
    upgraded_content = str(soup)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(upgraded_content)
    
    print(f"Upgraded: {file_path}")

# Directory containing your HTML files
directory = '.'  # Change to your folder path, e.g., '/path/to/your/website'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            upgrade_html_to_html5(os.path.join(root, file))