import React from 'react'

export default function Header({ darkMode, toggleTheme, exportToExcel, serverInfo }) {
  return (
    <div className="header">
      <div className="header-top">
        <div>
          <h1 className="title">Gestão Financeira</h1>
          <p className="subtitle">
            Controle contas a pagar e receber, centros de custo, vencimentos e recorrência.
          </p>
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={toggleTheme}>
            {darkMode ? 'Modo claro' : 'Modo escuro'}
          </button>
          <button className="btn btn-primary" onClick={exportToExcel}>
            Baixar Excel
          </button>
        </div>
      </div>

      <div className="footer-info">
        Instância backend respondendo: <strong>{serverInfo || 'carregando...'}</strong>
      </div>
    </div>
  )
}