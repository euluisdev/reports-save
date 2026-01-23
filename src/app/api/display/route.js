import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'relatorios.xlsx');

  try {
    const fileBuffer = await fs.readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet); //convert to JSON
    const normalizado = data.map((linha) => ({
      ...linha,
      Selecionado:
        linha.Selecionado === true ||
        linha.Selecionado === 'TRUE' ||
        linha.Selecionado === 1
    }));

    return NextResponse.json(normalizado, { status: 200 });


    /* return NextResponse.json(data, { status: 200 }); */
  } catch (error) {
    console.error("Erro ao ler o Excel:", error);
    return NextResponse.json({ error: "Erro ao ler o Excel" }, { status: 500 });
  }
}
