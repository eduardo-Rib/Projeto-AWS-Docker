import React, { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [status, setStatus] = useState("Carregando...");

  useEffect(() => {
    api.get("/")
      .then((res) => {
        setStatus(JSON.stringify(res.data));
      })
      .catch(() => {
        setStatus("Erro ao conectar com backend");
      });
  }, []);

  return (
    <div style={styles.container}>
      <h1>🚀 Projeto AWS Docker</h1>

      <div style={styles.card}>
        <h2>Status da API:</h2>
        <p>{status}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial",
    textAlign: "center",
    marginTop: "50px"
  },
  card: {
    border: "1px solid #ccc",
    padding: "20px",
    width: "300px",
    margin: "0 auto",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  }
};

export default App;