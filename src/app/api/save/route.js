export const runtime = 'nodejs';


import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function POST(req) {
  const filePath = path.join(process.cwd(), 'data', 'relatorios.xlsx');

  try {
    const formData = await req.json(); // Dados recebidos do formulário
    console.log(formData);

    // Verifica se o arquivo já existe
    let workbook;
    let worksheet;
    try {
      await fs.access(filePath); // Testa se o arquivo existe
      const fileBuffer = await fs.readFile(filePath);
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      worksheet = workbook.Sheets[workbook.SheetNames[0]];
    } catch (error) {
      // Cria novo workbook com cabeçalhos se o arquivo não existir
      workbook = XLSX.utils.book_new();
      const headers = [
        "Part Number", "Part Name", "Semana", "Solicitante",
        "Técnico", "Turno", "Equipamento", "Motivo", "Observações"
      ];
      const newSheet = XLSX.utils.aoa_to_sheet([headers]);
      XLSX.utils.book_append_sheet(workbook, newSheet, "Relatórios");
      worksheet = workbook.Sheets["Relatórios"];
    }

    // Converte a planilha para JSON
    const existingData = XLSX.utils.sheet_to_json(worksheet);

    // Adiciona os dados do formulário
    existingData.push({
      "Part Number": formData.partNumber,
      "Part Name": formData.partName,
      "Semana": formData.semana,
      "Solicitante": formData.solicitante,
      "Técnico": formData.tecnico,
      "Turno": formData.turno,
      "Equipamento": formData.equipamento,
      "Motivo": formData.motivo,
      "Observações": formData.observacoes,
    });

    // Cria nova planilha com os dados atualizados
    const updatedSheet = XLSX.utils.json_to_sheet(existingData, { skipHeader: false });
    const updatedWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(updatedWorkbook, updatedSheet, "Relatórios");

    // Salva o arquivo atualizado
    const updatedBuffer = XLSX.write(updatedWorkbook, { type: 'buffer', bookType: 'xlsx' });
    await fs.writeFile(filePath, updatedBuffer);

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Erro ao salvar no Excel:", error);
    return new Response(JSON.stringify({ error: "Erro ao salvar no Excel" }), { status: 500 });
  }
}



