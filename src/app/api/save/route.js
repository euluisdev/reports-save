export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export async function POST(req) {
  const filePath = path.join(process.cwd(), 'data', 'relatorios.xlsx');

  try {
    const formData = await req.json(); 
    console.log(formData);

    let workbook;
    let worksheet;
    let existingData = [];

    try {
      await fs.access(filePath);
      const fileBuffer = await fs.readFile(filePath);
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      worksheet = workbook.Sheets[workbook.SheetNames[0]];
      existingData = XLSX.utils.sheet_to_json(worksheet);

    } catch (error) {
      workbook = XLSX.utils.book_new();
      const headers = [
        "Número de Relatório", "Part Number", "Part Name", "Semana", "Solicitante",
        "Técnico", "Turno", "Equipamento", "Motivo", "Observações"
      ];

      const newSheet = XLSX.utils.aoa_to_sheet([headers]);
      XLSX.utils.book_append_sheet(workbook, newSheet, "Relatórios");
      worksheet = workbook.Sheets["Relatórios"];
      existingData = [];
    }

    const anoAtual = new Date().getFullYear();
    const prefixo = `C${anoAtual}.`;
    let maxNumero = 0;

    existingData.forEach((item) => {
      const codigo = item["Número de Relatório"];
      if (typeof codigo === "string" && codigo.startsWith(prefixo)) {
        const numeroStr = codigo.split('.')[1]; 
        const numero = parseInt(numeroStr, 10);
        if (!isNaN(numero) && numero > maxNumero) {
          maxNumero = numero;
        }
      }
    });
    const numeroRelatorio = `${prefixo}${String(maxNumero + 1).padStart(4, '0')}`;

    const novoRelatorio = {
      "Número de Relatório": numeroRelatorio,
      "Part Number": formData.partNumber,
      "Part Name": formData.partName,
      "Semana": formData.semana,
      "Solicitante": formData.solicitante,
      "Técnico": formData.tecnico,
      "Turno": formData.turno,
      "Equipamento": formData.equipamento,
      "Motivo": formData.motivo,
      "Observações": formData.observacoes || "",
    };

    existingData.push(novoRelatorio);
    
    const updatedSheet = XLSX.utils.json_to_sheet(existingData, { skipHeader: false });
    const updatedWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(updatedWorkbook, updatedSheet, "Relatórios");

    const updatedBuffer = XLSX.write(updatedWorkbook, { type: 'buffer', bookType: 'xlsx' });
    await fs.writeFile(filePath, updatedBuffer);

    return new Response(JSON.stringify({ success: true, numeroRelatorio }), { status: 200 });

  } catch (error) {
    console.error("Erro ao salvar no Excel:", error);
    return new Response(JSON.stringify({ error: "Erro ao salvar no Excel" }), { status: 500 });
  }
}
