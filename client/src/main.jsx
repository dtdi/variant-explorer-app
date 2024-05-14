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
} from "./routes/WorkspaceRoot";

import ColumnSettingsPage, {
  loader as columnSettingsLoader,
} from "./pages/Workspace/ColumnSettingsPage";

import AggregateRoot, {
  loader as aggregateLoader,
  action as aggregateRedirectAction,
} from "./routes/AggregateRoot";

import DiagramPage, {
  loader as diagramLoader,
} from "./pages/Aggregate/DiagramPage";
import CasesPage from "./pages/Aggregate/CasesPage";
import AggregatesPage, {
  loader as aggregatesLoader,
} from "./pages/Aggregate/AggregatesPage";
import OverviewPage, {
  loader as overviewLoader,
} from "./pages/Aggregate/OverviewPage";

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
    loader: workspaceLoader,
    path: "/workspace/settings/:workspaceId/",
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/workspace/settings/:workspaceId/",
        loader: columnSettingsLoader,
        element: <ColumnSettingsPage />,
      },
    ],
  },
  {
    element: <AggregateRoot />,
    path: "/workspace/:workspaceId/:aggregateId?",
    loader: aggregateLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/workspace/:workspaceId/:aggregateId/diagram",
        loader: diagramLoader,
        element: <DiagramPage />,
      },
      {
        path: "/workspace/:workspaceId/:aggregateId/cases",
        element: <CasesPage />,
      },
      {
        path: "/workspace/:workspaceId/:aggregateId",
        loader: overviewLoader,
        element: <OverviewPage />,
      },
      {
        path: "/workspace/:workspaceId/:aggregateId/aggregates",
        loader: aggregatesLoader,
        element: <AggregatesPage />,
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
