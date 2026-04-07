import { useEffect, useState, type ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { HomePage } from '../pages/HomePage';
import { restoreUserSession } from '../services/auth-api';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const [authState, setAuthState] = useState<'checking' | 'ready' | 'blocked'>(
    'checking'
  );

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      const isAuthenticated = await restoreUserSession();

      if (isActive) {
        setAuthState(isAuthenticated ? 'ready' : 'blocked');
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, []);

  if (authState === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFBF5] px-4 text-center text-base font-black text-gray-900">
        Đang xác thực phiên đăng nhập...
      </main>
    );
  }

  if (authState === 'blocked') {
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
