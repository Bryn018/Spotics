import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SessionContext } from './context/SessionContext';
import { useSessionQuery } from './hooks/useSessionQuery';
import { Button } from './components/ui/button';

export default function App() {
  const { data, status, refetch } = useSessionQuery();

  if (status === 'pending') {
    return (
      <FullScreenState
        title="Loading your session"
        subtitle="Hold tight while we fetch your Spotics account."
      />
    );
  }

  if (status === 'error') {
    return (
      <FullScreenState
        title="We couldn’t load your session"
        subtitle="Refresh or try again in a moment."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <SessionContext.Provider
      value={{
        authenticated: data?.authenticated ?? false,
        user: data?.user ?? null,
      }}
    >
      <RouterProvider router={router} />
    </SessionContext.Provider>
  );
}

interface FullScreenStateProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function FullScreenState({ title, subtitle, actionLabel, onAction }: FullScreenStateProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-3">Spotics</p>
        <h1 className="text-3xl font-semibold mb-2">{title}</h1>
        {subtitle && <p className="text-gray-400 max-w-md mx-auto">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-gradient-to-r from-purple-500 to-pink-500">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
