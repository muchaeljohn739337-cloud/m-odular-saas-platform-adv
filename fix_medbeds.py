#!/usr/bin/env python3
"""Fix escaped quotes in medbeds/book/page.tsx"""

file_path = r"c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\frontend\src\app\medbeds\book\page.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the escaped quotes - they should just be regular quotes in JSX
content = content.replace(r'className=\"border rounded px-3 py-2\" type=\"date\" title=\"Preferred appointment date\"', 
                         'className="border rounded px-3 py-2" type="date" title="Preferred appointment date"')
content = content.replace(r'className=\"border rounded px-3 py-2\" type=\"time\" title=\"Preferred appointment time\"',
                         'className="border rounded px-3 py-2" type="time" title="Preferred appointment time"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed escaped quotes in medbeds/book/page.tsx")
