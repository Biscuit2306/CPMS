import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Nextrouteintro from './components/Nextrouteintro.jsx'

// ✅ Initialize axios with credentials globally
import './config/axios.js'

function RootApp() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Preloader shows for 4.6 seconds (duration of Nextrouteintro animation)
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 4600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showPreloader && <Nextrouteintro />}
      {!showPreloader && <App />}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
