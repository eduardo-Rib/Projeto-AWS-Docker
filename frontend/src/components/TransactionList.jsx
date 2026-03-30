import React from 'react'

function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

function isNearDueDate(dateString, status) {
  if (status === 'pago') return false

  const due = new Date(dateString)
  const today = new Date()

  due.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  return diff >= 0 && diff <= 7
}

export default function TransactionList({ transactions, onOpenPayModal }) {
  return (
    <div className="card">
      <h2 className="section-title">Contas cadastradas</h2>

      <div className="transaction-list">
        {transactions.length === 0 && (
          <div className="empty-state">Nenhuma conta cadastrada ainda.</div>
        )}

        {transactions.map((txn) => (
          <div
            key={txn.id}
            className={`transaction-item ${isNearDueDate(txn.due_date, txn.status) ? 'warning' : ''}`}
          >
            <div className="transaction-top">
              <div className="transaction-main">
                <div className="transaction-title">{txn.entity_name}</div>
                <div>{txn.description || 'Sem descrição'}</div>

                <div className="badges">
                  <span className="badge">{txn.type}</span>
                  <span className="badge">{txn.status}</span>
                  {txn.is_recurrent && <span className="badge">recorrente</span>}
                  {txn.cost_center_name && <span className="badge">{txn.cost_center_name}</span>}
                </div>
              </div>

              <div>
                <div className={`amount ${txn.type}`}>{formatMoney(txn.amount)}</div>
              </div>
            </div>

            <div className="meta">
              <span>Vencimento: {txn.due_date}</span>
              <span>Pagamento: {txn.paid_at || 'não realizado'}</span>
              <span>Moeda: {txn.currency || 'não informada'}</span>
            </div>

            {txn.status !== 'pago' && (
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-success" onClick={() => onOpenPayModal(txn)}>
                  Marcar como pago/recebido
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}