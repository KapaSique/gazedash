import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Sessions from "../pages/Sessions";
import SessionDetail from "../pages/SessionDetail";
import NotFound from "../pages/NotFound";
import Timeline from "../pages/Timeline";

export const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/sessions", element: <Sessions /> },
  { path: "/sessions/:id", element: <SessionDetail /> },
  { path: "/sessions/:id/stats", element: <SessionDetail/>, errorElement: <RouteError/>},
  { path: "/sessions/:id/timeline", element: <Timeline/>, errorElement: <RouteError/>},
  { path: "*", element: <NotFound/>},
]);

function RouteError(){
  return (
    <div style = {{padding: 16}}>
      <h2>Oops</h2>
      <p>Something went wrong... Check console /Network</p>
      <a href = "/sessions">Back to sessions</a>
    </div>
  );
}