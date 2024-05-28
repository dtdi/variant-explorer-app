import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
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
} from "./routes/AggregateRoot";

import DiagramPage2 from "./pages/Aggregate/DiagramPageV2";
import CasesPage from "./pages/Aggregate/CasesPage";
import AggregatesPage, {
  loader as aggregatesLoader,
} from "./pages/Aggregate/AggregatesPage";
import ColumnsPage, {
  loader as columnsLoader,
} from "./pages/Aggregate/ColumnsPage";
import OverviewPage, {
  loader as overviewLoader,
} from "./pages/Aggregate/OverviewPage";
import CollectionsPage, {
  loader as collectionsLoader,
} from "./pages/Workspace/CollectionsPage";
import { GlobalStateProvider } from "./global-context";
import Toaster from "./components/Toaster";

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
      {
        path: "/workspace/settings/:workspaceId/collections",
        loader: collectionsLoader,
        element: <CollectionsPage />,
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
        element: <DiagramPage2 />,
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
      {
        path: "/workspace/:workspaceId/:aggregateId/columns",
        loader: columnsLoader,
        element: <ColumnsPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalStateProvider>
      <RouterProvider router={router} />
      <Toaster />
    </GlobalStateProvider>
  </React.StrictMode>
);
