'use client';

import styles from './page.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>Metrologia IEB-PE</h3>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {currentYear} Sistema de Controle de Relatórios Dimensionais. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
  