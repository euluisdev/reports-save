'use client';

import { useEffect, useState, useRef } from 'react';
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import styles from './graphics.module.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

export default function GraficosPage() {
  const [dados, setDados] = useState([]);
  const [semanaSelecionada, setSemanaSelecionada] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    fetch('/api/display')
      .then(res => res.json())
      .then(setDados)
      .catch(console.error);
  }, []);

  const contagemSemana = {};
  dados.forEach(item => {
    const semana = item.Semana?.trim();
    if (semana) {
      contagemSemana[semana] = (contagemSemana[semana] || 0) + 1;
    }
  });


  const contagemMotivo = {};
  dados
    .filter(item => {
      const semana = item.Semana?.trim();
      return !semanaSelecionada || semana === semanaSelecionada;
    })
    .forEach(item => {
      const motivo = item.Motivo?.trim();
      if (motivo) {
        contagemMotivo[motivo] = (contagemMotivo[motivo] || 0) + 1;
      }
    });

  const semanasUnicas = [...new Set(dados.map(item => item.Semana?.trim()).filter(Boolean))]
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      return numA - numB;
    });

  const generateColors = (num) => {
    const colors = [];
    for (let i = 0; i < num; i++) {
      const hue = Math.floor((360 / num) * i);
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  };

  const labelsMotivo = Object.keys(contagemMotivo);
  const valoresMotivo = Object.values(contagemMotivo);
  const total = valoresMotivo.reduce((sum, val) => sum + val, 0);

  const pieData = {
    labels: labelsMotivo,
    datasets: [
      {
        data: valoresMotivo,
        backgroundColor: generateColors(labelsMotivo.length),
      },
    ],
  };

  const pieOptions = {
    plugins: {
      datalabels: {
        formatter: (value) => {
          const percent = ((value / total) * 100).toFixed(1);
          return `${percent}%`;
        },
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14,
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw;
            const percent = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  };

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
        backgroundColor: '#219b11',
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

  const formatarDataAtual = () => {
    const data = new Date();
    const dia = data.getDate();
    const ano = data.getFullYear();
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const mes = meses[data.getMonth()];
    return `${dia} de ${mes} de ${ano}`;
  };


  const handleImprimirPDF = () => {
    const input = containerRef.current;
    if (!input) return;

    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('graficos.pdf');
    });
  };

  return (
    <>
      <div ref={containerRef} className={styles.container}>
        <h2 className={styles.title}>Quantidade de Medições X Motivos da Medição</h2>

        <div className={styles.filtroContainer}>
          <label htmlFor="semanaSelect" className={styles.filtroLabel}>Filtrar por Semana:</label>
          <select
            id="semanaSelect"
            className={styles.filtroSelect}
            value={semanaSelecionada}
            onChange={e => setSemanaSelecionada(e.target.value)}
          >
            <option value="">Todas</option>
            {semanasUnicas.map(semana => (
              <option key={semana} value={semana}>Week {semana}</option>
            ))}
          </select>
          <div className={styles.totalContainer}>
            Total de Medições: <span className={styles.totalValor}>{total}</span>
          </div>
        </div>

        <div>
          <div className={styles.graficoPizzaContainer}>
            <Pie data={pieData} options={pieOptions} />
            <div className={styles.legenda}>
              {pieData.labels.map((label, index) => (
                <div key={label} className={styles.legendaItem}>
                  <span
                    className={styles.corQuadrado}
                    style={{ backgroundColor: pieData.datasets[0].backgroundColor[index] }}
                  ></span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <h2 className={styles.titleTwo}>Controles por Semana</h2>
          <Bar data={barData} options={barOptions} />
        </div>
        <div className={styles.dataAtual}>Igarassu, {formatarDataAtual()}</div>
      </div>
      <div>
      <button onClick={handleImprimirPDF} className={styles.btnPrint}>
        Export PDF
      </button>
      </div>
    </>
  );
}
