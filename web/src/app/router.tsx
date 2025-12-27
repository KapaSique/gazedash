import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Sessions from "../pages/Sessions";
import SessionDetail from "../pages/SessionDetail";
import SessionInfo from "../pages/SessionInfo";

export const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/sessions", element: <Sessions /> },
  { path: "/sessions/:id", element: <SessionDetail /> },
]);