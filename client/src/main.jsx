import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import AppRoot, { loader as appStateLoader } from "./routes/AppRoot";
import AppOverview, { loader as workspacesLoader } from "./pages/App/Overview";
import AppSettings, { loader as settingsLoader } from "./pages/App/Settings";

import ErrorPage from "./pages/ErrorPage";

import WorkspaceRoot, {
  loader as workspaceLoader,
  action as workspaceRedirectAction,
} from "./routes/WorkspaceRoot";

import ProcessMapPage, {
  loader as processMapLoader,
} from "./pages/Process/ProcessMapPage";
import CaseExplorer, {
  loader as casesLoader,
} from "./pages/Process/CaseExplorer";

const globalState = {
  apiUrl: "http://localhost:41211",
  jobs: {},
};

export const ApiContext = React.createContext();

// todo replace with createMemoryRouter
const router = createBrowserRouter([
  {
    element: <AppRoot />,
    loader: appStateLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        loader: workspacesLoader,
        element: <AppOverview />,
      },
      {
        path: "/settings",
        loader: settingsLoader,
        element: <AppSettings />,
      },
    ],
  },
  {
    element: <WorkspaceRoot />,
    path: "/workspace/:workspaceId/:aggregateId?",
    loader: workspaceLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/workspace/:workspaceId/:aggregateId",
        loader: processMapLoader,
        element: <ProcessMapPage />,
      },
      {
        path: "/workspace/:workspaceId/:aggregateId/cases",
        loader: casesLoader,
        element: <CaseExplorer />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApiContext.Provider value={globalState}>
      <RouterProvider router={router} />
    </ApiContext.Provider>
  </React.StrictMode>
);
