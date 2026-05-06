import { createBrowserRouter, Navigate } from "react-router";
import { Home } from "./pages/Home";
import { Analytics } from "./pages/Analytics";
import { Login } from "./pages/Login";
import { Export } from "./pages/Export";
import { RootLayout } from "./layouts/RootLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard",
    Component: RootLayout,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, Component: Home },
      { path: "analytics", Component: Analytics },
      { path: "export", Component: Export },
      { path: "*", element: <Navigate to="/dashboard" replace />, errorElement: <ErrorBoundary /> },
    ],
  },
]);