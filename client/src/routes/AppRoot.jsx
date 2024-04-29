import { useRef, useState } from "react";
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

export async function loader() {
  const appState = {
    name: "Variant Explorer",
    author: "Tobias Fehrer",
  };
  return { appState };
}

export default function AppRoot() {
  const { appState } = useLoaderData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const returnFocusRef = useRef(null);

  return (
    <ThemeProvider>
      <BaseStyles>
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            height: "100vh",
          }}
        >
          <PageLayout>
            <PageLayout.Header>
              <PageHeader>
                <PageHeader.TitleArea>
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
            <PageLayout.Content>
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
            <PageLayout.Footer></PageLayout.Footer>
          </PageLayout>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
