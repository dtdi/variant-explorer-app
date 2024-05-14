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
  CommentDiscussionIcon,
  CommitIcon,
  FileDiffIcon,
  FoldUpIcon,
  GearIcon,
  GraphIcon,
  ReplyIcon,
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
import TreeNavigation from "../components/Navigation/TreeNavigation";

import { useLoaderData, useNavigate } from "react-router-dom";

export async function action({ params, request }) {
  let formData = await request.formData();
  console.log(params, request);
}

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;
  if (!aggregateId) {
    return redirect("root");
  }

  const apiUrl = "http://localhost:41211";

  const data = await fetch(
    `${apiUrl}/workspaces/getWorkspace/${workspaceId}/${aggregateId}`
  ).then((res) => res.json());

  return data;
}

export const AggregateContext = React.createContext();

export default function WorkspaceRoot() {
  const { workspace, aggregate, stats, breadcrumbs } = useLoaderData();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <BaseStyles>
        <AggregateContext.Provider value={{ workspace, aggregate, stats }}>
          <SplitPageLayout containerWitdth="fullWidth">
            <SplitPageLayout.Header padding={"condensed"}>
              <PageHeader>
                <PageHeader.TitleArea>
                  <PageHeader.LeadingAction>
                    <IconButton
                      icon={ReplyIcon}
                      aria-label="Menu"
                      variant="invisible"
                      onClick={() => navigate("/")}
                    />
                  </PageHeader.LeadingAction>
                  <Breadcrumbs>
                    {breadcrumbs.map((b) => (
                      <Breadcrumbs.Item
                        onClick={() =>
                          navigate(`/workspace/${workspace.id}/${b.id}`)
                        }
                        key={b.id}
                      >
                        {b.name}
                      </Breadcrumbs.Item>
                    ))}
                  </Breadcrumbs>
                  <PageHeader.Actions>
                    <IconButton aria-label="Workflows" icon={WorkflowIcon} />
                    <IconButton aria-label="Insights" icon={GraphIcon} />
                    <Button variant="primary" trailingVisual={TriangleDownIcon}>
                      Add Item
                    </Button>
                    <IconButton
                      aria-label="workspace Settings"
                      icon={GearIcon}
                      onClick={() => {
                        navigate(`/settings/${workspace.id}`);
                      }}
                    />
                  </PageHeader.Actions>
                </PageHeader.TitleArea>
                <PageHeader.Description>
                  <Text sx={{ fontSize: 1, color: "fg.muted" }}>
                    Part of the <BranchName>{workspace.name}</BranchName>{" "}
                    <BranchName>{stats.number_cases} cases</BranchName>{" "}
                    <BranchName>{stats.number_events} events</BranchName>
                  </Text>
                </PageHeader.Description>
                <PageHeader.Navigation></PageHeader.Navigation>
              </PageHeader>
            </SplitPageLayout.Header>
            <SplitPageLayout.Pane
              divider={"line"}
              resizable={true}
              sticky={true}
            >
              <Box
                sx={{
                  display: "flex",
                  marginBottom: "16px",
                  alignItems: "center",
                }}
              >
                <IconButton
                  variant="invisible"
                  icon={FoldUpIcon}
                  aria-label="Back to Root"
                  onClick={() => navigate("")}
                >
                  Back to Root Aggregate
                </IconButton>
                <Heading as="h2" sx={{ fontSize: 16, marginLeft: "8px" }}>
                  Aggregates
                </Heading>
              </Box>
              <TreeNavigation up={3} />
            </SplitPageLayout.Pane>
            <SplitPageLayout.Content padding="condensed" width="full">
              <UnderlineNav aria-label="Process Overview">
                <UnderlineNav.Item
                  as={NavLink}
                  to={`/workspace/${workspace.id}/${aggregate._identifier}/`}
                  icon={CommentDiscussionIcon}
                >
                  Overview
                </UnderlineNav.Item>
                <UnderlineNav.Item
                  as={NavLink}
                  to={`/workspace/${workspace.id}/${aggregate._identifier}/diagram`}
                  icon={WorkflowIcon}
                >
                  Process Map
                </UnderlineNav.Item>
                <UnderlineNav.Item
                  as={NavLink}
                  to={`/workspace/${workspace.id}/${aggregate._identifier}/cases`}
                  counter={stats.number_cases}
                  icon={BriefcaseIcon}
                >
                  Cases
                </UnderlineNav.Item>
                <UnderlineNav.Item
                  as={NavLink}
                  to={`/workspace/${workspace.id}/${aggregate._identifier}/aggregates`}
                  counter={stats.number_aggregates}
                  icon={ChecklistIcon}
                >
                  Aggregates
                </UnderlineNav.Item>
              </UnderlineNav>
              <Outlet />
            </SplitPageLayout.Content>
          </SplitPageLayout>
        </AggregateContext.Provider>
      </BaseStyles>
    </ThemeProvider>
  );
}
