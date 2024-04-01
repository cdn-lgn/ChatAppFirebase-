import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { FirebaseProvider } from './context/firebaseContext';
import { ThemeContextProvider } from './context/themeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <FirebaseProvider>
    <ThemeContextProvider>
      {/*<React.StrictMode>    */}
        <App />
      {/*</React.StrictMode>*/}
    </ThemeContextProvider>
  </FirebaseProvider>
)
