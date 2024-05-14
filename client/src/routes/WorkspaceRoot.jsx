import React, { useRef, useState } from "react";
import {
  ThemeProvider,
  BaseStyles,
  useTheme,
  Box,
  PageLayout,
  UnderlineNav,
  Button,
  Text,
  IconButton,
  StateLabel,
  BranchName,
  Link,
  Breadcrumbs,
  SplitPageLayout,
  Heading,
} from "@primer/react";
import { Hidden, PageHeader } from "@primer/react/experimental";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChecklistIcon,
  ColumnsIcon,
  CommentDiscussionIcon,
  CommitIcon,
  FileDiffIcon,
  FoldUpIcon,
  GearIcon,
  GraphIcon,
  ReplyIcon,
  SlidersIcon,
  ThreeBarsIcon,
  TriangleDownIcon,
  WorkflowIcon,
} from "@primer/octicons-react";
import {
  Outlet,
  Link as RouterLink,
  NavLink,
  redirect,
} from "react-router-dom";

import { useLoaderData, useNavigate } from "react-router-dom";
import axios from "axios";

export async function action({ params, request }) {
  let formData = await request.formData();
  console.log(params, request);
}

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  const apiUrl = "http://localhost:41211";

  const data = await axios
    .get(`${apiUrl}/workspaces/getWorkspaces/${workspaceId}`)
    .then((res) => res.data);

  return data;
}

export const WorkspaceContext = React.createContext();

export default function WorkspaceRoot() {
  const { workspace } = useLoaderData();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <BaseStyles>
        <WorkspaceContext.Provider value={{ workspace }}>
          <PageLayout containerWidth="full">
            <PageLayout.Header>
              <PageHeader>
                <PageHeader.TitleArea>
                  <PageHeader.LeadingAction>
                    <IconButton
                      icon={ReplyIcon}
                      aria-label="Menu"
                      variant="invisible"
                      onClick={() => navigate(`/workspace/${workspace.id}`)}
                    />
                  </PageHeader.LeadingAction>
                  <PageHeader.Title>{workspace.name}</PageHeader.Title>
                </PageHeader.TitleArea>
                <PageHeader.Navigation>
                  <UnderlineNav aria-label="Process Work">
                    <UnderlineNav.Item
                      icon={ColumnsIcon}
                      as={NavLink}
                      to={`/workspace/settings/${workspace.id}/`}
                    >
                      Columns
                    </UnderlineNav.Item>
                    <UnderlineNav.Item
                      icon={SlidersIcon}
                      as={NavLink}
                      to={`/workspace/settings/${workspace.id}/properties`}
                    >
                      Discovery Preferences
                    </UnderlineNav.Item>
                  </UnderlineNav>
                </PageHeader.Navigation>
              </PageHeader>
            </PageLayout.Header>
            <PageLayout.Content padding="condensed">
              <Outlet />
            </PageLayout.Content>
          </PageLayout>
        </WorkspaceContext.Provider>
      </BaseStyles>
    </ThemeProvider>
  );
}
