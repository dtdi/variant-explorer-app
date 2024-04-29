import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createMemoryRouter,
  RouterProvider,
} from "react-router-dom";
import AppRoot, { loader as appStateLoader } from "./routes/AppRoot";
import AppOverview, { loader as processesLoader } from "./pages/App/Overview";

import ErrorPage from "./pages/ErrorPage";
import ProcessRoot, {
  loader as processOverviewLoader,
} from "./routes/ProcessRoot";
import AggregateRoot, {
  loader as aggregateLoader,
} from "./routes/AggregateRoot";
import ProcessMapPage, {
  loader as processMapLoader,
} from "./pages/Process/ProcessMapPage";
import CaseExplorer, {
  loader as casesLoader,
} from "./pages/Process/CaseExplorer";
import ProcessAggregates, {
  loader as aggregatesLoader,
} from "./pages/Process/ProcessAggregates";

// todo replace with createMemoryRouter
const router = createBrowserRouter([
  {
    element: <AppRoot />,
    loader: appStateLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        loader: processesLoader,
        element: <AppOverview />,
      },
    ],
  },
  {
    element: <ProcessRoot />,
    path: "/process/:processId",
    loader: processOverviewLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/process/:processId/map",
        loader: processMapLoader,
        element: <ProcessMapPage />,
      },
      {
        path: "/process/:processId/cases",
        loader: casesLoader,
        element: <CaseExplorer />,
      },
      {
        path: "/process/:processId/aggregates",
        loader: aggregatesLoader,
        element: <ProcessAggregates />,
      },
    ],
  },
  {
    element: <AggregateRoot />,
    path: "/aggregate/:aggregateId",
    loader: aggregateLoader,
    errorElement: <ErrorPage />,
    children: [],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
