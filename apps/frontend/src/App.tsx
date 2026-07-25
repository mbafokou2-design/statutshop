import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthPages } from './pages/auth/AuthPages';
import { DashboardPlaceholder } from './pages/DashboardPlaceholder';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPages />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;