export const runtime = 'nodejs';


import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function POST(request) {
  const dados = await request.json();

  // Caminho para o arquivo Excel
  const filePath = path.resolve('data', 'relatorios.xlsx');
  const dir = path.dirname(filePath);

  // Garante que o diretório existe
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log('📁 Caminho do arquivo:', filePath);
  console.log('📄 Arquivo existe?', fs.existsSync(filePath));

  let workbook;

  try {
    if (fs.existsSync(filePath)) {
      try {
        workbook = XLSX.readFile(filePath);
        console.log('✅ Arquivo lido com sucesso');
      } catch (readError) {
        console.warn('⚠️ Arquivo existente, mas ilegível. Criando novo.');
        workbook = XLSX.utils.book_new();
      }
    } else {
      console.log('📄 Arquivo não encontrado. Criando novo workbook...');
      workbook = XLSX.utils.book_new();
    }
  } catch (fsError) {
    console.error('❌ Erro inesperado com o arquivo:', fsError.message);
    return NextResponse.json({ error: 'Erro ao acessar o arquivo Excel' }, { status: 500 });
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

  try {
    XLSX.writeFile(workbook, filePath);
    console.log('✅ Dados salvos com sucesso no arquivo Excel.');
  } catch (error) {
    console.error('❌ Erro ao salvar o arquivo Excel:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar o arquivo Excel', detalhe: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Dados salvos com sucesso!',
  });
}
