'use client';

import { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function GraficosPage() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch('/api/display')
      .then(res => res.json())
      .then(setDados)
      .catch(console.error);
  }, []);

  const contagemSolicitante = {};
  const contagemSemana = {};

  dados.forEach(item => {
    // Contagem de solicitantes (para pizza)
    contagemSolicitante[item.Solicitante] = (contagemSolicitante[item.Solicitante] || 0) + 1;

    // Contagem por semana (para gráfico de colunas)
    contagemSemana[item.Semana] = (contagemSemana[item.Semana] || 0) + 1;
  });

  const pieData = {
    labels: Object.keys(contagemSolicitante),
    datasets: [
      {
        data: Object.values(contagemSolicitante),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  // Ordenar as semanas numericamente
  const semanaEntries = Object.entries(contagemSemana).sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, ''), 10);
    const numB = parseInt(b[0].replace(/\D/g, ''), 10);
    return numA - numB;
  });

  const barData = {
    labels: semanaEntries.map(entry => entry[0]),
    datasets: [
      {
        label: 'Controles por Semana',
        data: semanaEntries.map(entry => entry[1]),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const barOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: context => `Controles: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantidade de Controles',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Semana',
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>Gráfico de Solicitantes (Pizza)</h2>
      <Pie data={pieData} />
      <h2 style={{ marginTop: '3rem' }}>Gráfico de Controles por Semana (Coluna)</h2>
      <Bar data={barData} options={barOptions} />
    </div>
  );
}