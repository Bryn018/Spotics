import { useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center">
        <div className="text-6xl mb-4">😢</div>
        <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
        <p className="text-gray-400 mb-6">
          {error instanceof Error 
            ? error.message 
            : "An unexpected error occurred"}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
        >
          Go Home
        </button>
        {error instanceof Error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
              Technical Details
            </summary>
            <pre className="mt-2 p-4 bg-black/50 rounded-lg text-xs text-red-400 overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
