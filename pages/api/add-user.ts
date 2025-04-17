import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

const SPREADSHEET_ID = '1VjkCkc9LBg_D3VHgXjiObqZZamPHTpwSDTEGtmrXSMI';
const SHEET_NAME = 'Foglalás';

function columnLetter(index: number): string {
  let letters = '';
  while (index >= 0) {
    letters = String.fromCharCode((index % 26) + 65) + letters;
    index = Math.floor(index / 26) - 1;
  }
  return letters;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { displayName } = req.body;
  if (!displayName) return res.status(400).json({ error: 'displayName is required' });

  try {
    const key = JSON.parse(process.env.GOOGLE_CREDENTIALS as string);
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!1:1`,
    });

    const headers = headerRes.data.values?.[0] ?? [];
    const existing = headers.slice(2);
    if (existing.includes(displayName)) {
      return res.status(200).json({ message: 'Már szerepel' });
    }

    const sorted = [...existing, displayName].sort((a, b) => a.localeCompare(b, 'hu'));
    const newIndex = sorted.indexOf(displayName);
    const insertIndex = newIndex + 2;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          insertDimension: {
            range: { sheetId: 0, dimension: 'COLUMNS', startIndex: insertIndex, endIndex: insertIndex + 1 },
            inheritFromBefore: false,
          }
        }]
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${columnLetter(insertIndex)}1`,
      valueInputOption: 'RAW',
      requestBody: { values: [[displayName]] },
    });

    res.status(200).json({ message: '✅ Hozzáadva', column: insertIndex });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sheets hiba', details: err });
  }
}
