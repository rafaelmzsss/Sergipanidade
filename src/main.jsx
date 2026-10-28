import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles_global/global.css'
import { PlanoProvider } from './context/PlanoContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PlanoProvider>
      <App />
    </PlanoProvider>
  </React.StrictMode>,
)
