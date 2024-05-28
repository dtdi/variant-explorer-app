import { useContext, useRef, useState } from "react";
import {
  ThemeProvider,
  BaseStyles,
  Box,
  PageLayout,
  UnderlineNav,
  Button,
  IconButton,
} from "@primer/react";
import { PageHeader, Dialog, Blankslate } from "@primer/react/experimental";
import {
  BookIcon,
  ChecklistIcon,
  CommentDiscussionIcon,
  CommitIcon,
  FileDiffIcon,
  FileDirectoryIcon,
  GearIcon,
  GraphIcon,
  ThreeBarsIcon,
  TriangleDownIcon,
  WorkflowIcon,
} from "@primer/octicons-react";
import { NavLink, Outlet, useLoaderData } from "react-router-dom";
import { GlobalContext } from "../global-context";

export async function loader() {
  const apiUrl = "http://localhost:41211";
  const appState = await fetch(`${apiUrl}/environment`).then((res) =>
    res.json()
  );
  return { appState };
}

export default function AppRoot() {
  const { apiUrl } = useContext(GlobalContext);
  const { appState } = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const returnFocusRef = useRef(null);

  return (
    <ThemeProvider>
      <BaseStyles>
        <PageLayout padding="none" containerWidth="full">
          <PageLayout.Header padding={"none"} sx={{ bg: "canvas.inset" }}>
            <PageHeader>
              <PageHeader.TitleArea sx={{ p: 3, pb: 0 }}>
                <PageHeader.LeadingAction>
                  <IconButton
                    ref={returnFocusRef}
                    icon={ThreeBarsIcon}
                    aria-label="Menu"
                    variant="invisible"
                    onClick={() => setSidebarOpen(true)}
                  />
                </PageHeader.LeadingAction>
                <PageHeader.Title>{appState.name}</PageHeader.Title>
              </PageHeader.TitleArea>

              <PageHeader.Navigation>
                <UnderlineNav aria-label="Process Work">
                  <UnderlineNav.Item
                    icon={FileDirectoryIcon}
                    counter={appState.workspaces.length}
                    aria-current="page"
                    as={NavLink}
                    to="/"
                  >
                    Workspaces
                  </UnderlineNav.Item>

                  <UnderlineNav.Item
                    as={NavLink}
                    to="/settings"
                    icon={GearIcon}
                  >
                    Settings
                  </UnderlineNav.Item>
                  <UnderlineNav.Item counter={4} icon={FileDiffIcon}>
                    Files Changes
                  </UnderlineNav.Item>
                </UnderlineNav>
              </PageHeader.Navigation>
            </PageHeader>
          </PageLayout.Header>
          <PageLayout.Content width="xlarge" padding="condensed">
            {sidebarOpen && (
              <Dialog
                title={appState.name}
                subtitle="Menu"
                width="small"
                returnFocusRef={returnFocusRef}
                position={"left"}
                onClose={() => setSidebarOpen(false)}
              ></Dialog>
            )}
            <Outlet />
          </PageLayout.Content>
        </PageLayout>
      </BaseStyles>
    </ThemeProvider>
  );
}
