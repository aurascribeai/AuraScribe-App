from pathlib import Path
text = Path('AuraScribe_Frontend/components/SessionViewer.tsx').read_text()
lines = text.splitlines()
for idx in range(200, 216):
    print(f'{idx+1}: {repr(lines[idx])}')

