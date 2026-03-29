import Papa from 'papaparse';
import dayjs from 'dayjs';

export interface DutyRecord {
  date: string; // YYYY-MM-DD
  openDuty: string;
  closeDuty: string;
  originalDateString: string;
  week: string;
  exco: string;
}

export async function fetchDutyData(): Promise<DutyRecord[]> {
  try {
    const response = await fetch('/excel/ITCtable.csv');
    if (!response.ok) throw new Error('Failed to fetch CSV');
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const records: DutyRecord[] = [];
          const rows = results.data as string[][];

          let currentWeek = "WEEK 1";
          let currentExco = "Unknown EXCO";

          for (const row of rows) {
            // Capture WEEK and EXCO headers
            if (row[0] && typeof row[0] === 'string' && row[0].toUpperCase().startsWith('WEEK')) {
              currentWeek = row[0].trim();
              if (row[2]) {
                currentExco = row[2].trim();
              }
            }

            // Looking for rows with at least 4 items where the 4th item matches date signature
            if (row.length >= 4) {
              const open = row[1]?.trim();
              const close = row[2]?.trim();
              const dateStr = row[3]?.trim();

              if (dateStr && dateStr.match(/^\d{1,2}-[a-zA-Z]{3}$/)) {
                // Parse "16-Mar" to "2026-03-16"
                const [d, m] = dateStr.split('-');
                const monthMap: Record<string, string> = {
                  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                  'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                };
                const mm = monthMap[m] || '01';
                const dd = d.padStart(2, '0');
                const isoDate = `2026-${mm}-${dd}`;

                // Push only if there's an actual duty person (avoid empty rows)
                if (open && close && open !== 'OPEN' && close !== 'CLOSE') {
                  records.push({
                    date: isoDate,
                    openDuty: open,
                    closeDuty: close,
                    originalDateString: dateStr,
                    week: currentWeek,
                    exco: currentExco
                  });
                }
              }
            }
          }
          resolve(records);
        },
        error: (err: Error) => reject(err)
      });
    });
  } catch (err) {
    console.error('Error fetching/parsing duty data:', err);
    return [];
  }
}
