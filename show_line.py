from pathlib import Path
line = Path('AuraScribe_Frontend/components/SessionViewer.tsx').read_text().splitlines()[205]
print(line)
print([hex(ord(c)) for c in line])

