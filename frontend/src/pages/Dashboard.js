import { useEffect, useState } from 'react'
import api from '../api'
import { Bar } from 'react-chartjs-2'
import Navbar from '../components/Navbar'
import Card from '../components/Card'

export default function Dashboard(){
  const [contas,setContas]=useState([])

  useEffect(()=>{
    api.get('/contas').then(r=>setContas(r.data))
  },[])

  const receitas = contas.filter(c=>c.tipo==='receber')
  const despesas = contas.filter(c=>c.tipo==='pagar')

  const data={
    labels:['Receitas','Despesas'],
    datasets:[{
      data:[
        receitas.reduce((a,b)=>a+b.valor,0),
        despesas.reduce((a,b)=>a+b.valor,0)
      ]
    }]
  }

  return (
    <div>
      <Navbar />

      <h1>Dashboard</h1>

      <Bar data={data}/>

      {contas.map(c=> (
        <Card key={c.id} alerta={c.alerta}>
          {c.descricao} - {c.valor}
        </Card>
      ))}
    </div>
  )
}