import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PopupProvider } from './components/PopupContext';
import { PopUpContainer } from './components/PopUp';
import LandingPage from './pages/LandingPage';
import ClientDashboard from './pages/ClientDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <PopupProvider>
        <AuthProvider>
          <PopUpContainer />
          <div className="app-container">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/client"
                element={
                  <ProtectedRoute requiredRole="CLIENT">
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pharmacy"
                element={
                  <ProtectedRoute requiredRole="PHARMACY">
                    <PharmacyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </PopupProvider>
    </Router>
  );
}

export default App;
