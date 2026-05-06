import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { DevPreviewBanner } from './components/DevPreviewBanner';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DevPreviewBanner />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}