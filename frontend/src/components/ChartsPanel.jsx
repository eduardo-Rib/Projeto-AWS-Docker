import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, XAxis, YAxis, Bar, CartesianGrid, Legend } from 'recharts'

export default function ChartsPanel({ dashboard }) {
  const pieData = [
    { name: 'Receitas', value: dashboard.total_receber || 0 },
    { name: 'Despesas', value: dashboard.total_pagar || 0 }
  ]

  const barData = [
    { name: 'Receitas', total: dashboard.total_receber || 0 },
    { name: 'Despesas', total: dashboard.total_pagar || 0 },
    { name: 'Saldo', total: dashboard.saldo || 0 }
  ]

  return (
    <div className="card">
      <h2 className="section-title">Gráficos</h2>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={90} label>
              <Cell fill="#16a34a" />
              <Cell fill="#dc2626" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#123b73" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}