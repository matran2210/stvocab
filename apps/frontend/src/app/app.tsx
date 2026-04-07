import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { HomePage } from '../pages/HomePage';
import { getAuthToken } from '../utils/auth';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!getAuthToken()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
