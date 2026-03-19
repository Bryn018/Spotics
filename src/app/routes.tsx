import { createBrowserRouter, Navigate } from "react-router";
import { Home } from "./pages/Home";
import { Analytics } from "./pages/Analytics";
import { Login } from "./pages/Login";
import { RootLayout } from "./layouts/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/dashboard",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "analytics", Component: Analytics },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);