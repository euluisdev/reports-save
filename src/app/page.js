'use client';

import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { Copy } from "lucide-react"

export default function Home() {
  const [form, setForm] = useState({
    partNumber: '',
    partName: '',
    semana: '',
    solicitante: '',
    tecnico: '',
    turno: '',
    equipamento: '',
    motivo: '',
    observacoes: ''
  });
  const [numeroRelatorio, setNumeroRelatorio] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saudacao, setSaudacao] = useState('');

  useEffect(() => {
    const dataAtual = new Date();
    const horas = dataAtual.getHours();

    let saudacaoHora = 'Bom dia';
    if (horas >= 12 && horas < 18) saudacaoHora = 'Boa tarde';
    else if (horas >= 18) saudacaoHora = 'Boa noite';

    const opcoes = { day: '2-digit', month: 'short', year: 'numeric' };
    const dataFormatada = dataAtual
      .toLocaleDateString('pt-BR', opcoes)
      .replace('.', '');

    const mensagemCompleta = `${saudacaoHora}! Hoje é ${dataFormatada}`;

    let index = 0;
    let textoParcial = '';

    const intervalo = setInterval(() => {
      if (index < mensagemCompleta.length) {
        textoParcial += mensagemCompleta[index];
        setSaudacao(textoParcial);
        index++;
      } else {
        clearInterval(intervalo);
      }
    }, 60);

    return () => clearInterval(intervalo);
  }, []);

  const resetForm = () => {
    setForm({
      partNumber: '',
      partName: '',
      semana: '',
      solicitante: '',
      tecnico: '',
      turno: '',
      equipamento: '',
      motivo: '',
      observacoes: ''
    });
    setShowModal(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showModal) return;

    const { partNumber, partName, semana, solicitante, tecnico, turno, equipamento, motivo } = form;

    if (
      !partNumber.trim() ||
      !partName.trim() ||
      !semana ||
      !solicitante ||
      !tecnico ||
      !turno ||
      !equipamento ||
      !motivo
    ) {
      console.log("Formulário inválido: preencha todos os campos obrigatórios.");
      return;
    }

    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const result = await response.json();
    setNumeroRelatorio(result.numeroRelatorio);
    setShowModal(true);
  };

  const copiarRelatorio = (texto) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(texto);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = texto;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <>
      <main className={styles.formContainer}>
        <h1>CONTROLE DE RELATÓRIOS DIMENSIONAIS</h1>
        <div style={{ textAlign: 'center' }}>
          <p className={styles.saudacao}>{saudacao}</p>
        </div>
      </main>

      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <input className={styles.inputField} name="partNumber" placeholder="Part Number" value={form.partNumber} onChange={handleChange} required />
        <input className={styles.inputField} name="partName" placeholder="Part Name" value={form.partName} onChange={handleChange} required />

        <select className={styles.inputField} name="semana" value={form.semana} onChange={handleChange}>
          <option value="" disabled>Week</option>
          {Array.from({ length: 52 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Week {i + 1}</option>
          ))}
        </select>

        <select className={styles.inputField} name="solicitante" value={form.solicitante} onChange={handleChange}>
          <option value="" disabled>Solicitante</option>
          <option value="QUALIDADE">Qualidade</option>
          <option value="ENGENHARIA">Engenharia</option>
          <option value="FERRAMENTARIA">Ferramentaria</option>
          <option value="MANUTENÇÃO">Manutenção</option>
        </select>

        <select className={styles.inputField} name="tecnico" value={form.tecnico} onChange={handleChange}>
          <option value="" disabled>Técnico</option>
          <option value="izaac">Izaac</option>
          <option value="luis">Luís</option>
          <option value="matheus">Matheus</option>
        </select>

        <select className={styles.inputField} name="turno" value={form.turno} onChange={handleChange}>
          <option value="" disabled>Selecione o turno</option>
          <option value="1º TURNO">Primeiro Turno</option>
          <option value="2º TURNO">Segundo Turno</option>
          <option value="3º TURNO">Terceiro Turno</option>
          <option value="ADM">ADM</option>
        </select>

        <select className={styles.inputField} name="equipamento" value={form.equipamento} onChange={handleChange}>
          <option value="" disabled>Selecione o Equipamento</option>
          <option value="METRASCAN">MetraScan</option>
          <option value="CMM GLOBAL">CMM Global</option>
          <option value="PAQUÍMETRO">Paquímetro</option>
          <option value="MICRÔMETRO">Micrômetro</option>
        </select>

        <select className={styles.inputField} name="motivo" value={form.motivo} onChange={handleChange}>
          <option value="" disabled>Motivo da Medição</option>
          <option value="ANÁLISE DIMENSIONAL">Análise Dimensional</option>
          <option value="ACOMP PRODUÇÃO 1/400">Acomp produção 1/400</option>
          <option value="PPAP">PPAP</option>
          <option value="TRYOUT">Try Out</option>
          <option value="CRIAÇÃO PROGRAMA">Criação de Programa</option>
          <option value="ODM">Alteração de ODM</option>
          <option value="GEOMETRIA">Conform Geométrica</option>
          <option value="PROBLEMA PRODUÇÃO">Problemas de Linha</option>
          <option value="LAMENTAÇÃO CLIENTE">Lamentação Cliente</option>
          <option value="INSP LAYOUT">Insp LayOut - Produto</option>
          <option value="INSP DISPOSITIVO">Insp Dispositivo</option>
          <option value="REDUÇÃO BLANK">Redução do Blank</option>
          <option value="DISP SOLDA">Dispositivo de Solda</option>
        </select>

        <textarea className={`${styles.inputField} ${styles.fullWidth}`} name="observacoes" value={form.observacoes} placeholder="Observações" onChange={handleChange} />

        <button className={styles.button} type="submit">Salvar</button>

      </form>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>Seus dados foram salvos com sucesso!</p>
            <p>
              <strong>Número do Relatório:</strong> {numeroRelatorio}
              <button 
                className={styles.buttonCopy}
                type="button"
                onClick={() => copiarRelatorio(numeroRelatorio)}
              >
                <Copy />
              </button>

            </p>
            <button 
              onClick={resetForm}
              className={styles.buttonOk}
              >OK</button>
          </div>
        </div>
      )}
    </>
  );
}

