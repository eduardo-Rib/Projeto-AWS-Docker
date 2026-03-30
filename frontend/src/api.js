import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const healthCheck = () => axios.get('/health')
export const getDashboard = () => api.get('/dashboard')
export const getTransactions = () => api.get('/transactions')
export const createTransaction = (payload) => api.post('/transactions', payload)
export const payTransaction = (id, payload) => api.post(`/transactions/${id}/pay`, payload)
export const getCostCenters = () => api.get('/cost-centers')
export const createCostCenter = (payload) => api.post('/cost-centers', payload)

export default api