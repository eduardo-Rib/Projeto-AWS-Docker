import React, { useState, useEffect } from 'react'

export default function PayModal({ transaction, costCenters, onClose, onConfirm }) {
  const [form, setForm] = useState({
    payment_date: '',
    currency: 'BRL',
    cost_center_id: ''
  })

  useEffect(() => {
    if (transaction) {
      setForm({
        payment_date: '',
        currency: 'BRL',
        cost_center_id: transaction.cost_center_id || ''
      })
    }
  }, [transaction])

  if (!transaction) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    await onConfirm(transaction.id, {
      ...form,
      cost_center_id: form.cost_center_id ? Number(form.cost_center_id) : null
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="section-title">Registrar pagamento/recebimento</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            className="input"
            type="date"
            value={form.payment_date}
            onChange={(e) => setForm((prev) => ({ ...prev, payment_date: e.target.value }))}
            required
          />

          <input
            className="input"
            placeholder="Moeda"
            value={form.currency}
            onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
            required
          />

          <select
            className="select full"
            value={form.cost_center_id}
            onChange={(e) => setForm((prev) => ({ ...prev, cost_center_id: e.target.value }))}
          >
            <option value="">Selecione o centro de custo</option>
            {costCenters.map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.name}
              </option>
            ))}
          </select>

          <button className="btn btn-success" type="submit">
            Confirmar
          </button>

          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  )
}