import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./app/App.tsx";
import { SessionProvider } from "./app/context/SessionContext";
import "./styles/index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <App />
    </SessionProvider>
  </QueryClientProvider>
);
// FORCE BUILD 1776526199
