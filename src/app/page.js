'use client';

import styles from './page.module.css';
import { useState } from 'react';

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

/*     await fetch('/api/salvar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }); */
    console.log('Dados enviados!')
  };

  return (
    <>
      <main className={styles.formContainer}>
        <h1>CONTROLE DE RELATÓRIOS DIMENSIONAIS</h1>
      </main>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <input className={styles.inputField} name="partNumber" placeholder="Part Number"  onChange={handleChange} required />
        <input className={styles.inputField} name="partName" placeholder="Part Name" onChange={handleChange} required />
        <select
          className={styles.inputField}
          name="semana"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="" disabled>Week</option>
          {Array.from({ length: 52 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Week {i + 1}
            </option>
          ))}
        </select>
        <select
          className={styles.inputField}
          name="solicitante"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="" disabled>Solicitante</option>
          <option value="QUALIDADE">Qualidade</option>
          <option value="ENGENHARIA">Engenharia</option>
          <option value="FERRAMENTARIA">Ferramentaria</option>
          <option value="MANUTENÇÃO">Manutenção</option>
        </select>
        <select
          className={styles.inputField}
          name="tecnico"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="" disabled>Técnico</option>
          <option value="izaac">Izaac</option>
          <option value="luis">Luís</option>
          <option value="matheus">Matheus</option>
        </select>
        <select
          className={styles.inputField}
          name="turno"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="" disabled>Selecione o turno</option>
          <option value="1º TURNO">Primeiro Turno</option>
          <option value="2º TURNO">Segundo Turno</option>
          <option value="3º TURNO">Terceiro Turno</option>
          <option value="ADM">ADM</option>
        </select>
        <select
          className={styles.inputField}
          name="equipamento"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="" disabled>Selecione o Equipamento</option>
          <option value="METRASCAN">MetraScan</option>
          <option value="CMM GLOBAL">CMM Global</option>
          <option value="PAQUÍMETRO">Paquímetro</option>
          <option value="MICRÔMETRO">Micrômetro</option>
        </select>
        <select
          className={styles.inputField}
          name="motivo"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="" disabled>Motivo da Medição</option>
          <option value="ANÁLISE">Análise</option>
          <option value="ACOMPANHAMENTO">Acomp produção</option>
          <option value="PPAP">PPAP</option>
          <option value="TRYOUT">Try Out</option>
          <option value="GEOMETRIA">Conform Geométrica</option>
        </select>
        <textarea
          className={`${styles.inputField} ${styles.fullWidth}`}
          name="observacoes"
          placeholder="Observações"
          onChange={handleChange}
        />

        <button className={styles.button} type="submit">Enviar</button>
      </form>
    </>
  );
}

