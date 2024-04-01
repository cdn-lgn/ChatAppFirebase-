import React from 'react'; // Import React
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'; // Import necessary components from react-router-dom
import './App.css'; // Import CSS file
import MainPage from './components/mainPage'; // Import MainPage component
import Login from './components/login'; // Import Login component
import Signup from './components/Signup'; // Import Signup component
import { useFirebaseContext } from './context/firebaseContext'; // Import useFirebaseContext hook
import { ThemeContextProvider } from './context/themeContext'; // Import useFirebaseContext hook

const App = () => {
    console.log("App.jsx render...")

  // Destructure currentUser from useFirebaseContext hook
  const { currentUser } = useFirebaseContext();

  // ProtectedRoute component to handle protected routes
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />; // Redirect to login page if user is not logged in
    }
    return children;
  };
  

  return (
    <BrowserRouter>
      <Routes>
        {/* Define routes */}
        <Route path='/login' element={<Login />} /> {/* Route for Login */}
        <Route path='/signup' element={<Signup />} /> {/* Route for Signup */}

        {/* Route for MainPage, protected */}
        <Route path='/' 
          element={
            <ProtectedRoute>
              <MainPage/>
            </ProtectedRoute>
          }/>
      </Routes>
    </BrowserRouter>  
  );
}

export default App; // Export App component
