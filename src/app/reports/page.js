'use client';

import { useEffect, useState } from 'react';
import styles from './reports.module.css';

export default function VisualizarDados() {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const response = await fetch('/api/display');
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
    <div className={styles.container}>
      <h1 className={styles.title}>Relatórios Registrados</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Número de Relatório</th>
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
              <td>{linha["Número de Relatório"]}</td>
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

