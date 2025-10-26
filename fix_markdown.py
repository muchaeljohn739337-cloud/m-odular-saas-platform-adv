#!/usr/bin/env python3
import re

with open('MEDBED_CRYPTO_RECOVERY_VALIDATION_REPORT.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Fix emphasis headings (lines 386, 393, 400)
    if line.strip() == '**1. Seed Phrase Recovery**':
        new_lines.append('#### 1. Seed Phrase Recovery\n')
        i += 1
        continue
    elif line.strip() == '**2. Multi-Signature (M-of-N)**':
        new_lines.append('#### 2. Multi-Signature (M-of-N)\n')
        i += 1
        continue
    elif line.strip() == '**3. Social Recovery (Guardians)**':
        new_lines.append('#### 3. Social Recovery (Guardians)\n')
        i += 1
        continue
    
    # Fix bare URLs  
    elif '- Frontend: https://advanciapayledger.com/' in line:
        new_lines.append('- Frontend: [https://advanciapayledger.com](https://advanciapayledger.com)\n')
        i += 1
        continue
    elif '- Backend: https://api.advanciapayledger.com/' in line:
        new_lines.append('- Backend: [https://api.advanciapayledger.com](https://api.advanciapayledger.com)\n')
        i += 1
        continue
    
    # Fix code blocks without language (if ``` with nothing after it)
    elif line.strip() == '```' and i + 1 < len(lines):
        next_line = lines[i + 1].strip()
        if next_line.startswith('- id:') or next_line.startswith('- userId:'):
            new_lines.append('```prisma\n')
            i += 1
            continue
        elif next_line.startswith('POST') or next_line.startswith('GET') or next_line.startswith('PUT') or next_line.startswith('DELETE'):
            new_lines.append('```text\n')
            i += 1
            continue
    
    new_lines.append(line)
    i += 1

with open('MEDBED_CRYPTO_RECOVERY_VALIDATION_REPORT.md', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('✅ Applied comprehensive markdown fixes')
