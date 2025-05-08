// src/app/api/salvar/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function POST(request) {
  const dados = await request.json();

  // Caminho absoluto para o arquivo Excel (em /public/data)
  const filePath = path.join(process.cwd(), 'data', 'relatorios.xlsx');

  // Se o diretório não existir, crie
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let workbook;

  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
  } else {
    workbook = XLSX.utils.book_new();
  }

  const sheetName = 'Registros';
  let worksheet = workbook.Sheets[sheetName];
  const existingData = worksheet ? XLSX.utils.sheet_to_json(worksheet) : [];

  const novaEntrada = {
    DataHora: new Date().toLocaleString('pt-BR'),
    ...dados,
  };

  const updatedData = [...existingData, novaEntrada];
  const newSheet = XLSX.utils.json_to_sheet(updatedData);

  workbook.Sheets[sheetName] = newSheet;
  if (!workbook.SheetNames.includes(sheetName)) {
    workbook.SheetNames.push(sheetName);
  }

  XLSX.writeFile(workbook, filePath);

  return NextResponse.json({ success: true, message: 'Dados salvos com sucesso!' });
}
