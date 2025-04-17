import { google } from 'googleapis';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

// 🔐 FONTOS: credentials.json fájlt NE tedd publikussá, csak a szerver oldalon használd!
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Csak POST engedélyezett' });
  }

  const { displayName } = req.body;

  if (!displayName) {
    return res.status(400).json({ error: 'Név (pozícióval) kötelező' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!1:1`,
    });

    const headers = headerRes.data.values?.[0] ?? [];
    const existingUsers = headers.slice(2);
    if (existingUsers.includes(displayName)) {
      return res.status(200).json({ message: 'Már szerepel a táblázatban.' });
    }

    const sorted = [...existingUsers, displayName].sort((a, b) =>
      a.localeCompare(b, 'hu')
    );
    const newIndex = sorted.indexOf(displayName);
    const insertIndex = newIndex + 2;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: insertIndex,
                endIndex: insertIndex + 1,
              },
              inheritFromBefore: false,
            },
          },
        ],
      },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!${columnLetter(insertIndex)}1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[displayName]],
      },
    });

    res.status(200).json({ message: '✅ Új oszlop hozzáadva: ' + displayName });
  } catch (error) {
    console.error('❌ Hiba:', error);
    res.status(500).json({ error: 'Hiba történt a Sheets írás során.' });
  }
}
