import os
from datetime import datetime

# Generate commit message with current date & time
now = datetime.now()
commit_message = now.strftime("Update: %Y-%m-%d %H:%M:%S")

print(f"Commit message: {commit_message}")

# Run git commands
os.system("git add .")
os.system(f'git commit -m "{commit_message}"')
os.system("git push origin main")