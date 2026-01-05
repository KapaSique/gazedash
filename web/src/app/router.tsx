import { createBrowserRouter, Link, Outlet, useRouteError } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Sessions from "../pages/Sessions";
import SessionDetail from "../pages/SessionDetail";
import Timeline from "../pages/Timeline";
import NotFound from "../pages/NotFound";
import { Layout } from "@/shared/ui/Layout";

function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function RouteError() {
  const err = useRouteError();
  console.error(err);

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Oops</h2>
      <p className="text-muted-foreground">
        Something went wrong… Check console / Network
      </p>
      <Link className="text-primary underline" to="/sessions">
        Back to sessions
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/sessions", element: <Sessions /> },
      { path: "/sessions/:id", element: <SessionDetail /> },
      { path: "/sessions/:id/stats", element: <SessionDetail /> },
      { path: "/sessions/:id/timeline", element: <Timeline /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
