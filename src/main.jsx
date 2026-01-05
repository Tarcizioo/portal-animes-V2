import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // <--- Ele importa o "default" aqui
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)