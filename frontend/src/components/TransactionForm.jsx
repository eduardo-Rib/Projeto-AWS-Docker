import React, { useState } from 'react'

export default function TransactionForm({ costCenters, onCreateTransaction, onCreateCostCenter }) {
  const [form, setForm] = useState({
    type: 'pagar',
    entity_name: '',
    description: '',
    due_date: '',
    amount: '',
    is_recurrent: false,
    cost_center_id: ''
  })

  const [costCenterForm, setCostCenterForm] = useState({
    name: '',
    description: ''
  })

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    await onCreateTransaction({
      ...form,
      amount: Number(form.amount),
      cost_center_id: form.cost_center_id ? Number(form.cost_center_id) : null
    })

    setForm({
      type: 'pagar',
      entity_name: '',
      description: '',
      due_date: '',
      amount: '',
      is_recurrent: false,
      cost_center_id: ''
    })
  }

  const handleCreateCostCenter = async (e) => {
    e.preventDefault()
    await onCreateCostCenter(costCenterForm)
    setCostCenterForm({ name: '', description: '' })
  }

  return (
    <>
      <div className="card">
        <h2 className="section-title">Nova conta</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <select
            className="select"
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="pagar">Conta a pagar</option>
            <option value="receber">Conta a receber</option>
          </select>

          <input
            className="input"
            placeholder="Quem vai pagar / de quem vai receber"
            value={form.entity_name}
            onChange={(e) => handleChange('entity_name', e.target.value)}
            required
          />

          <input
            className="input full"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          <input
            className="input"
            type="date"
            value={form.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
            required
          />

          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="Valor"
            value={form.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            required
          />

          <select
            className="select"
            value={form.cost_center_id}
            onChange={(e) => handleChange('cost_center_id', e.target.value)}
          >
            <option value="">Selecione o centro de custo</option>
            {costCenters.map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.name}
              </option>
            ))}
          </select>

          <label className="checkbox-row full">
            <input
              type="checkbox"
              checked={form.is_recurrent}
              onChange={(e) => handleChange('is_recurrent', e.target.checked)}
            />
            Conta recorrente
          </label>

          <button className="btn btn-primary full" type="submit">
            Salvar conta
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="section-title">Novo centro de custo</h2>

        <form onSubmit={handleCreateCostCenter} className="form-grid">
          <input
            className="input"
            placeholder="Nome do centro de custo"
            value={costCenterForm.name}
            onChange={(e) => setCostCenterForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <input
            className="input"
            placeholder="Descrição"
            value={costCenterForm.description}
            onChange={(e) => setCostCenterForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <button className="btn btn-secondary full" type="submit">
            Cadastrar centro de custo
          </button>
        </form>
      </div>
    </>
  )
}