import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'relatorios.xlsx');

  try {
    const fileBuffer = await fs.readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro ao ler o Excel' }), {
      status: 500,
    });
  }
}