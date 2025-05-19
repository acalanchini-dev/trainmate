
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Configurazione semplificata senza provider di toast duplicati
createRoot(document.getElementById("root")!).render(<App />);
