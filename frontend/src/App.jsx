import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Sun, Moon, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = '/api';
const HEALTH_URL = '/health';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [serverInfo, setServerInfo] = useState('');

  useEffect(() => {
    axios
      .get(HEALTH_URL)
      .then((res) => setServerInfo(res.data.instance))
      .catch((err) => console.error('Erro ao buscar healthcheck:', err));

    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contas');
    XLSX.writeFile(wb, 'Relatorio_Financeiro.xlsx');
  };

  const isNearDueDate = (dateString) => {
    const due = new Date(dateString);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const chartData = [
    {
      name: 'A Receber',
      value: transactions
        .filter((t) => t.type === 'receber')
        .reduce((acc, t) => acc + t.amount, 0),
    },
    {
      name: 'A Pagar',
      value: transactions
        .filter((t) => t.type === 'pagar')
        .reduce((acc, t) => acc + t.amount, 0),
    },
  ];

  const COLORS = ['#3b82f6', '#1e3a8a'];

  return (
    <div className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-300">
          Gestão Financeira
        </h1>

        <div className="flex gap-4">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded"
          >
            <Download size={18} /> Excel
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            {darkMode ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-blue-900" />
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-lg shadow-lg bg-[var(--card-bg)]">
          <h2 className="text-xl font-semibold mb-4">
            Resumo (Receitas vs Despesas)
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-lg bg-[var(--card-bg)] overflow-y-auto h-96">
          <h2 className="text-xl font-semibold mb-4">Próximos Vencimentos</h2>

          <div className="space-y-4">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className={`p-4 rounded border-l-4 ${
                  isNearDueDate(txn.due_date) && txn.status !== 'pago'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-blue-500 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-bold">{txn.entity_name}</span>
                  <span className="font-bold text-lg">R$ {txn.amount}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span>Vence em: {txn.due_date}</span>
                  <span className="uppercase">{txn.type}</span>
                </div>

                {isNearDueDate(txn.due_date) && txn.status !== 'pago' && (
                  <span className="text-xs text-red-600 dark:text-red-400 font-bold">
                    Vencimento Próximo! (Menos de 7 dias)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-gray-500">
        Respondendo pela instância Backend:{' '}
        <span className="font-mono bg-gray-200 dark:bg-gray-800 p-1 rounded">
          {serverInfo}
        </span>
      </footer>
    </div>
  );
}