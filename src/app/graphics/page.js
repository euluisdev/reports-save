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

  // Refs separados para cada folha de impressão
  const pieSheetRef = useRef(null);
  const barSheetRef = useRef(null);

  useEffect(() => {
    fetch('/api/display')
      .then(res => res.json())
      .then(setDados)
      .catch(console.error);
  }, []);

  // --- Contagem por semana (sem filtro, para o gráfico de barras) ---
  const contagemSemana = {};
  dados.forEach(item => {
    const semana = item.Semana?.trim();
    if (semana) {
      contagemSemana[semana] = (contagemSemana[semana] || 0) + 1;
    }
  });

  // --- Contagem por motivo (com filtro de semana, para o pie) ---
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

  // --- Semanas únicas ordenadas ---
  const semanasUnicas = [...new Set(dados.map(item => item.Semana?.trim()).filter(Boolean))]
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      return numA - numB;
    });

  // --- Gerador de cor a partir de string ---
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 45%)`;
  };

  // --- Dados do Pie ---
  const labelsMotivo = Object.keys(contagemMotivo);
  const valoresMotivo = Object.values(contagemMotivo);
  const total = valoresMotivo.reduce((sum, val) => sum + val, 0);

  const pieData = {
    labels: labelsMotivo,
    datasets: [
      {
        data: valoresMotivo,
        backgroundColor: labelsMotivo.map(label => stringToColor(label)),
      },
    ],
  };

  const pieOptionsPercent = {
    devicePixelRatio: 3,
    plugins: {
      datalabels: {
        formatter: (value) => {
          const percent = ((value / total) * 100).toFixed(1);
          return `(${percent}%)`;
        },
        color: '#fff',
        font: { weight: 'bold', size: 12 },
        anchor: 'end',
        align: 'start',
      },
      legend: { display: false },
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
  const pieOptionsValor = {
    devicePixelRatio: 3,
    plugins: {
      datalabels: {
        formatter: (value) => value,
        color: '#fff',
        font: { weight: 'bold', size: 12 },
        anchor: 'end',
        align: 'start',
      },
      legend: { display: false },
    },
  };



  // --- Dados da Bar ---
  const semanaEntries = Object.entries(contagemSemana).sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, ''), 10);
    const numB = parseInt(b[0].replace(/\D/g, ''), 10);
    return numA - numB;
  });

  const barData = {
    labels: semanaEntries.map(entry => entry[0]),
    datasets: [
      {
        label: 'Controles / Semana',
        data: semanaEntries.map(entry => entry[1]),
        backgroundColor: '#219b11',
        barThickness: 30,
        barPercentage: 0.7,
      },
    ],
  };

  const barOptions = {
    devicePixelRatio: 3,
    plugins: {
      tooltip: {
        callbacks: {
          label: context => `Controles: ${context.raw}`,
        },
      },
      datalabels: {
        color: 'white',
        anchor: 'center',
        align: 'center',
        font: { weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'CONTROLS' },
      },
      x: {
        grid: { display: false, drawBorder: false },
        title: { display: true, text: 'WEEK' },
      },
    },
  };

  // --- Utilitários de data ---
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

  const obterAnoAtual = () => new Date().getFullYear();

  // --- Função genérica para exportar um ref como PDF landscape A4 ---
  const exportarPDF = (ref, nomeArquivo) => {
    const input = ref.current;
    if (!input) return;

    html2canvas(input, { scale: 3, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',       // A4 landscape: ~841 x 595 pt
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();   // ~841
      const pdfHeight = pdf.internal.pageSize.getHeight(); // ~595

      const imgProps = pdf.getImageProperties(imgData);

      // Fit imagem dentro da página mantendo proporção
      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
      const imgW = imgProps.width * ratio;
      const imgH = imgProps.height * ratio;

      const x = (pdfWidth - imgW) / 2;
      const y = (pdfHeight - imgH) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgW, imgH);
      pdf.save(nomeArquivo);
    });
  };

  return (
    <>
      <div ref={pieSheetRef} className={styles.sheet}>
        <h3 className={styles.title}>
          <img src="/logo-ieb.png" alt="Logo" className={styles.logoIeb} />
          CONTROLES REALIZADOS NA METROLOGIA EM {obterAnoAtual()}
        </h3>

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

        {/* Pie + Legenda */}
        <div className={styles.graficoPizzaContainer}>
          <div className={styles.pieWrapper}>
            <h4 className={styles.subTitle}>Percentual</h4>
            <Pie data={pieData} options={pieOptionsPercent} />
          </div>

          <div className={styles.pieWrapper}>
            <Pie data={pieData} options={pieOptionsValor} />
          </div>

          <div className={styles.legenda}>
            {pieData.labels.map((label, index) => (
              <div key={label} className={styles.legendaItem}>
                <span
                  className={styles.corQuadrado}
                  style={{ backgroundColor: pieData.datasets[0].backgroundColor[index] }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>



        <div className={styles.dataAtual}>Igarassu, {formatarDataAtual()}</div>
      </div>

      {/* Botão exportar Pie */}
      <div className={styles.btnRow}>
        <button onClick={() => exportarPDF(pieSheetRef, 'grafico-pie.pdf')} className={styles.btnPrint}>
          Export PDF — Pie Chart
        </button>
      </div>

      {/* ════════════ FOLHA 2 — BAR CHART ════════════ */}
      <div ref={barSheetRef} className={styles.sheet}>
        <h3 className={styles.title}>
          <img src="/logo-ieb.png" alt="Logo" className={styles.logoIeb} />
          CONTROLES REALIZADOS NA METROLOGIA EM {obterAnoAtual()}
        </h3>

        <div className={styles.barWrapper}>
          <Bar data={barData} options={barOptions} />
        </div>

        <div className={styles.dataAtual}>Igarassu, {formatarDataAtual()}</div>
      </div>

      {/* Botão exportar Bar */}
      <div className={styles.btnRow}>
        <button onClick={() => exportarPDF(barSheetRef, 'grafico-bar.pdf')} className={styles.btnPrint}>
          Export PDF — Bar Chart
        </button>
      </div>
    </>
  );
}
