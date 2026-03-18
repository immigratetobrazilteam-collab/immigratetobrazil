import os
from datetime import datetime

status = os.popen("git status --porcelain").read().strip()
now = datetime.now()

if status:
    commit_message = now.strftime("Update - %Y-%m-%d %H:%M:%S")
    print(f"Changes detected. Commit: {commit_message}")
    
    os.system("git add .")
    os.system(f'git commit -m "{commit_message}"')
else:
    commit_message = now.strftime("Deploy trigger - %Y-%m-%d %H:%M:%S")
    print(f"No changes. Creating empty commit: {commit_message}")
    
    os.system(f'git commit --allow-empty -m "{commit_message}"')

os.system("git push origin main")