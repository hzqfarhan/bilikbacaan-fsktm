import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

// Sheets to exclude — everything else is treated as a person's timetable
const EXCLUDED_SHEETS = new Set([
  'BLANK',
  'TIMETABLE_DATA',
  'TIMETABLE',
  'FREE_TIME',
]);

const TIME_SLOTS = [
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-1:00',
  '1:00-2:00',
  '2:00-3:00',
  '3:00-4:00',
  '4:00-5:00',
  '5:00-6:00',
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

// Row mapping: Row 3 = TIME header, Row 4 = MON, Row 5 = TUE, ...
// In xlsx 0-indexed: row index 2 = header, 3 = MON, 4 = TUE, etc.
const DAY_ROW_START = 3; // 0-indexed row for MON
const TIME_COL_START = 1; // 0-indexed col for first time slot (B column)

export const dynamic = 'force-dynamic'; // Always read fresh from disk

export async function GET() {
  try {
    const jadualDir = path.join(process.cwd(), 'public', 'jadual');
    
    if (!fs.existsSync(jadualDir)) {
      return NextResponse.json({ error: 'jadual directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(jadualDir).filter(f => f.endsWith('.xlsm'));

    const timetable: Record<string, Record<string, Record<string, string>>> = {};
    const peopleDetails: Record<string, { fullname: string; exco: string }> = {};
    const people = new Set<string>();

    for (const file of files) {
      const filePath = path.join(jadualDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      // Auto-detect person sheets
      const sheetNames = workbook.SheetNames.filter(
        (name) => !EXCLUDED_SHEETS.has(name.toUpperCase())
      );

      for (const person of sheetNames) {
        people.add(person);
        const sheet = workbook.Sheets[person];
        const personData: Record<string, Record<string, string>> = {};

        // Extract Fullname and Exco from the sheet (search within first 20 rows, col B & C)
        let fullname = person;
        let exco = 'Memerlukan Kemaskini';
        for (let r = 0; r < 20; r++) {
          const cellB = sheet[XLSX.utils.encode_cell({ r, c: 1 })];
          if (cellB) {
            const label = String(cellB.v).trim().toUpperCase();
            if (label === 'FULLNAME') {
              const cellC = sheet[XLSX.utils.encode_cell({ r, c: 2 })];
              if (cellC) fullname = String(cellC.v).trim();
            } else if (label === 'EXCO') {
              const cellC = sheet[XLSX.utils.encode_cell({ r, c: 2 })];
              if (cellC) exco = String(cellC.v).trim();
            }
          }
        }
        peopleDetails[person] = { fullname, exco };

        for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
          const day = DAYS[dayIdx];
          const rowIdx = DAY_ROW_START + dayIdx; // 0-indexed
          const dayData: Record<string, string> = {};

          for (let slotIdx = 0; slotIdx < TIME_SLOTS.length; slotIdx++) {
            const colIdx = TIME_COL_START + slotIdx; // 0-indexed
            const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
            const cell = sheet[cellAddress];
            const value = cell ? String(cell.v || '').trim() : '';

            dayData[TIME_SLOTS[slotIdx]] = value ? 'BUSY' : 'FREE';
          }

          personData[day] = dayData;
        }

        timetable[person] = personData;
      }
    }

    return NextResponse.json({
      people: Array.from(people),
      days: DAYS,
      timeSlots: TIME_SLOTS,
      timetable,
      peopleDetails,
    });
  } catch (error) {
    console.error('Error reading timetable:', error);
    return NextResponse.json({ error: 'Failed to read timetable' }, { status: 500 });
  }
}
