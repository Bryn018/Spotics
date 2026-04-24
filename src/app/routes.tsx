import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Home } from "./pages/Home";
import { Analytics } from "./pages/Analytics";
import { Login } from "./pages/Login";
import { Export } from "./pages/Export";
import { RootLayout } from "./layouts/RootLayout";
import { AuthGuard } from "./components/AuthGuard";

function ProtectedLayout() {
  return (
    <AuthGuard>
      <RootLayout />
    </AuthGuard>
  );
}

function PublicLogin() {
  return (
    <AuthGuard>
      <Login />
    </AuthGuard>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicLogin />,
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: <ProtectedLayout />,
    children: [
      { index: true, Component: Home },
      { path: "analytics", Component: Analytics },
      { path: "export", Component: Export },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
