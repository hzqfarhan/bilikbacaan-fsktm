import openpyxl
import json

file_path = 'public/jadual/Jadual Semester 1 (2526).xlsm'
wb = openpyxl.load_workbook(file_path, data_only=True)

# Dump FARHAN sheet rows 1-15 to understand the merged cell layout
sheet = wb['FARHAN']
output = []
for row in range(1, 16):
    row_data = []
    for col in range(1, 13):
        cell = sheet.cell(row=row, column=col)
        val = cell.value
        row_data.append(str(val) if val is not None else "")
    output.append(f"Row {row}: {json.dumps(row_data)}")

with open('debug_rows.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print('\n'.join(output))
