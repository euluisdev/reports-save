'use client';

import { useEffect, useState } from 'react';

export default function VisualizarDados() {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const response = await fetch('/api/display'); // endpoint GET
        const data = await response.json();
        setDados(data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  if (carregando) return <p>Carregando...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Relatórios Registrados</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Part Name</th>
            <th>Semana</th>
            <th>Solicitante</th>
            <th>Técnico</th>
            <th>Turno</th>
            <th>Equipamento</th>
            <th>Motivo</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((linha, index) => (
            <tr key={index}>
              <td>{linha["Part Number"]}</td>
              <td>{linha["Part Name"]}</td>
              <td>{linha["Semana"]}</td>
              <td>{linha["Solicitante"]}</td>
              <td>{linha["Técnico"]}</td>
              <td>{linha["Turno"]}</td>
              <td>{linha["Equipamento"]}</td>
              <td>{linha["Motivo"]}</td>
              <td>{linha["Observações"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
