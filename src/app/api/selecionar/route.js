export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function POST(req) {
  const { numeroRelatorio, selecionado } = await req.json();
  const filePath = path.join(process.cwd(), 'data', 'relatorios.xlsx');

  try {
    const buffer = await fs.readFile(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const dados = XLSX.utils.sheet_to_json(worksheet);

    const atualizados = dados.map((linha) =>
      linha["Número de Relatório"] === numeroRelatorio
        ? { ...linha, Selecionado: selecionado }
        : linha
    );

    const novaSheet = XLSX.utils.json_to_sheet(atualizados);
    workbook.Sheets[sheetName] = novaSheet;

    const novoBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });

    await fs.writeFile(filePath, novoBuffer);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar seleção' }, { status: 500 });
  }
}
