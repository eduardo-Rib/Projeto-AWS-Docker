import React from 'react'

function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

export default function SummaryCards({ dashboard }) {
  return (
    <div className="card">
      <h2 className="section-title">Resumo financeiro</h2>

      <div className="summary-grid">
        <div className="summary-item">
          <h4>Total a receber</h4>
          <p>{formatMoney(dashboard.total_receber)}</p>
        </div>

        <div className="summary-item">
          <h4>Total a pagar</h4>
          <p>{formatMoney(dashboard.total_pagar)}</p>
        </div>

        <div className="summary-item">
          <h4>Saldo</h4>
          <p>{formatMoney(dashboard.saldo)}</p>
        </div>

        <div className="summary-item">
          <h4>Pendentes / Pagas</h4>
          <p>{dashboard.pendentes} / {dashboard.pagas}</p>
        </div>
      </div>
    </div>
  )
}