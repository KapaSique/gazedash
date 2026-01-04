import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Sessions from "../pages/Sessions";
import SessionDetail from "../pages/SessionDetail";
import NotFound from "../pages/NotFound";
import Timeline from "../pages/Timeline";
import RouteError from "../pages/RouteError";
import RootLayout from "./RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "sessions", element: <Sessions /> },
      { path: "sessions/:id", element: <SessionDetail /> },
      { path: "sessions/:id/stats", element: <SessionDetail /> },
      { path: "sessions/:id/timeline", element: <Timeline /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
