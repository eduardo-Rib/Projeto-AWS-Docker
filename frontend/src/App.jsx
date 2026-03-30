import React, { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'

import {
  healthCheck,
  getDashboard,
  getTransactions,
  createTransaction,
  payTransaction,
  getCostCenters,
  createCostCenter
} from './api'

import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import PayModal from './components/PayModal'
import ChartsPanel from './components/ChartsPanel'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [serverInfo, setServerInfo] = useState('')
  const [transactions, setTransactions] = useState([])
  const [costCenters, setCostCenters] = useState([])
  const [dashboard, setDashboard] = useState({
    total_receber: 0,
    total_pagar: 0,
    saldo: 0,
    pendentes: 0,
    pagas: 0
  })
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const loadData = async () => {
    const [healthRes, dashboardRes, transactionsRes, costCentersRes] = await Promise.all([
      healthCheck(),
      getDashboard(),
      getTransactions(),
      getCostCenters()
    ])

    setServerInfo(healthRes.data.instance)
    setDashboard(dashboardRes.data)
    setTransactions(transactionsRes.data)
    setCostCenters(costCentersRes.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : ''
  }, [darkMode])

  const exportToExcel = () => {
    const rows = transactions.map((t) => ({
      ID: t.id,
      Tipo: t.type,
      Pessoa: t.entity_name,
      Descricao: t.description,
      Vencimento: t.due_date,
      Valor: t.amount,
      Status: t.status,
      Recorrente: t.is_recurrent ? 'Sim' : 'Não',
      DataPagamento: t.paid_at,
      Moeda: t.currency,
      CentroDeCusto: t.cost_center_name
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio')
    XLSX.writeFile(workbook, 'relatorio_financeiro.xlsx')
  }

  const handleCreateTransaction = async (payload) => {
    await createTransaction(payload)
    await loadData()
  }

  const handleCreateCostCenter = async (payload) => {
    await createCostCenter(payload)
    await loadData()
  }

  const handleConfirmPayment = async (id, payload) => {
    await payTransaction(id, payload)
    setSelectedTransaction(null)
    await loadData()
  }

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  }, [transactions])

  return (
    <div className="app">
      <div className="container">
        <Header
          darkMode={darkMode}
          toggleTheme={() => setDarkMode((prev) => !prev)}
          exportToExcel={exportToExcel}
          serverInfo={serverInfo}
        />

        <div className="grid">
          <div className="left-column">
            <SummaryCards dashboard={dashboard} />
            <TransactionForm
              costCenters={costCenters}
              onCreateTransaction={handleCreateTransaction}
              onCreateCostCenter={handleCreateCostCenter}
            />
          </div>

          <div className="right-column">
            <ChartsPanel dashboard={dashboard} />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <TransactionList
            transactions={sortedTransactions}
            onOpenPayModal={setSelectedTransaction}
          />
        </div>

        <PayModal
          transaction={selectedTransaction}
          costCenters={costCenters}
          onClose={() => setSelectedTransaction(null)}
          onConfirm={handleConfirmPayment}
        />
      </div>
    </div>
  )
}