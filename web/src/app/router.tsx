import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Sessions from "../pages/Sessions";
import SessionDetail from "../pages/SessionDetail";

export const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/sessions", element: <Sessions /> },
  { path: "/sessions/:id", element: <SessionDetail /> },
  { path: "/sessions/:id/stats", element: <SessionDetail/>, errorElement: <RouteError/>},
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