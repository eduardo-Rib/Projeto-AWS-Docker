export default function Card({ children, alerta }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      margin: 10,
      padding: 10,
      background: alerta ? '#ffcccc' : '#fff'
    }}>
      {children}
    </div>
  )
}