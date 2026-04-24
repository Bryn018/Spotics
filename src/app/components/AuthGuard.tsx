import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authenticated, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
          <p className="text-gray-400">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!authenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (authenticated && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
