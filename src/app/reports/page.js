'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './reports.module.css';

export default function VisualizarDados() {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroData, setFiltroData] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const calendarioRef = useRef(null);

  function excelSerialDateToJSDate(serial) {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400 * 1000);
    return date.toLocaleDateString('pt-BR') + ' - ' + date.toLocaleTimeString('pt-BR');
  }

  function formatarDataParaInput(date) {
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
  }

  async function toggleSelected(linha) {
    const novoValor = !linha.Selecionado;

    setDados((prev) =>
      prev.map((item) =>
        item["Número de Relatório"] === linha["Número de Relatório"]
          ? { ...item, Selecionado: novoValor }
          : item
      )
    );

    await fetch('/api/selecionar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numeroRelatorio: linha["Número de Relatório"],
        selecionado: novoValor
      })
    });
  }


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

  useEffect(() => {
    const fecharFora = (e) => {
      if (calendarioRef.current && !calendarioRef.current.contains(e.target)) {
        setMostrarCalendario(false);
      }
    };
    document.addEventListener('mousedown', fecharFora);
    return () => document.removeEventListener('mousedown', fecharFora);
  }, []);

  const dadosFiltrados = dados.filter((linha) => {
    if (!filtroData) return true;

    let dataString = linha["DataHoraCadastro"];

    if (typeof dataString === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dataString * 86400 * 1000);
      const dataFormatada = formatarDataParaInput(date);
      return dataFormatada === filtroData;
    }

    if (typeof dataString === 'string') {
      const dataParte = dataString.split(' - ')[0];
      const dataFormatada = dataParte.split('/').reverse().join('-');
      return dataFormatada === filtroData;
    }

    return false;
  });

  const ultimos30 = dadosFiltrados.slice(-50);

  if (carregando) return <p>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Controle de Atividades da Metrologia</h1>

      <div className={styles.tabelaContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Número de Relatório</th>
              <th className={styles.thComCalendario}>
                Data
                <span
                  className={styles.seta}
                  onClick={() => setMostrarCalendario(!mostrarCalendario)}
                >
                  ▼
                </span>
                {mostrarCalendario && (
                  <div className={styles.dropdown} ref={calendarioRef}>
                    <div className={styles.inputWrapper}>
                      <input
                        type="date"
                        className={styles.inputDate}
                        value={filtroData}
                        onChange={(e) => {
                          setFiltroData(e.target.value);
                          setMostrarCalendario(false);
                        }}
                      />
                      {filtroData && (
                        <button
                          className={styles.clearButton}
                          onClick={() => {
                            setFiltroData('');
                            setMostrarCalendario(false);
                          }}
                          title="Limpar filtro"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </th>
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
            {ultimos30.length === 0 ? (
              <tr>
                <td colSpan={11} className={styles.semDados}>
                  Nenhum relatório encontrado para a data selecionada. Tente outra data.
                </td>
              </tr>
            ) : (
              ultimos30.map((linha, index) => (
                <tr key={index}>
                  <td className={styles.numberReport}>
                    <span
                      className={`${styles.checkBox} ${linha.Selecionado ? styles.checkBoxActive : ''
                        }`}
                      onClick={() => toggleSelected(linha)}
                    />
                    {linha["Número de Relatório"]}
                  </td>
                  <td>
                    {typeof linha["DataHoraCadastro"] === 'number'
                      ? excelSerialDateToJSDate(linha["DataHoraCadastro"])
                      : linha["DataHoraCadastro"]}
                  </td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
