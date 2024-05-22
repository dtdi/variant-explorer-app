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
  Label,
  LabelGroup,
} from "@primer/react";
import { Hidden, PageHeader } from "@primer/react/experimental";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChecklistIcon,
  ColumnsIcon,
  CommentDiscussionIcon,
  CommitIcon,
  DownloadIcon,
  FileDiffIcon,
  FoldUpIcon,
  GearIcon,
  GraphIcon,
  PencilIcon,
  PinIcon,
  ReplyIcon,
  RepoIcon,
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
import axios from "axios";
import { formatDuration } from "../utils";
import { Icon } from "reaflow";

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

  const data = await axios(
    `${apiUrl}/workspaces/getWorkspace/${workspaceId}/${aggregateId}`
  ).then((res) => res.data);

  return data;
}

export const AggregateContext = React.createContext();

export default function WorkspaceRoot() {
  const { workspace, aggregate, stats, breadcrumbs, explanation } =
    useLoaderData();

  const formatLabelValue = (value) => {
    if (value.display_as === "duration") {
      return formatDuration(value.value);
    }
    if (value.display_as === "number") {
      return formantNumber(value.value);
    }
    return value.value;
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <BaseStyles>
        <AggregateContext.Provider
          value={{ workspace, aggregate, stats, explanation }}
        >
          <SplitPageLayout containerWitdth="fullWidth">
            <SplitPageLayout.Header
              sx={{ bg: "canvas.inset" }}
              padding={"none"}
            >
              <PageHeader>
                <PageHeader.ContextArea sx={{ p: 3, pb: 0 }} hidden={false}>
                  <PageHeader.ParentLink
                    hidden={false}
                    onClick={() => navigate("/")}
                  ></PageHeader.ParentLink>
                  <PageHeader.ContextBar hidden={false}>
                    <Breadcrumbs>
                      {breadcrumbs.map((b, idx) => (
                        <Breadcrumbs.Item
                          selected={idx === breadcrumbs.length - 1}
                          onClick={() =>
                            navigate(`/workspace/${workspace.id}/${b.id}`)
                          }
                          key={b.id}
                        >
                          {b.name}
                        </Breadcrumbs.Item>
                      ))}
                    </Breadcrumbs>
                  </PageHeader.ContextBar>
                  <PageHeader.ContextAreaActions hidden={false}>
                    <IconButton
                      aria-label="Bookmarks"
                      icon={RepoIcon}
                      onClick={() => {
                        navigate(`workspace/collections/${workspace.id}`);
                      }}
                    />
                    <IconButton
                      aria-label="Workspace Settings"
                      icon={GearIcon}
                      onClick={() => {
                        navigate(`/workspace/settings/${workspace.id}`);
                      }}
                    />
                  </PageHeader.ContextAreaActions>
                </PageHeader.ContextArea>
                <PageHeader.TitleArea
                  sx={{ p: 3, pt: 0, pb: 0, alignItems: "center" }}
                >
                  <PageHeader.Title>{aggregate.data.name}</PageHeader.Title>
                  <PageHeader.TrailingAction>
                    <IconButton
                      icon={PencilIcon}
                      aria-label="Rename Group"
                      variant="invisible"
                      onClick={() => navigate("/")}
                    />
                  </PageHeader.TrailingAction>

                  <PageHeader.Actions>
                    <IconButton aria-label="Pin Aggregate" icon={PinIcon} />
                    <Button variant="primary" trailingVisual={TriangleDownIcon}>
                      Add Item
                    </Button>
                    <IconButton
                      aria-label="Download Group as Event Log"
                      icon={DownloadIcon}
                    />
                  </PageHeader.Actions>
                </PageHeader.TitleArea>
                <PageHeader.Description sx={{ pl: 3, pr: 3, display: "flex" }}>
                  <Text
                    as="div"
                    sx={{
                      fontSize: 1,
                      color: "fg.muted",
                      flexGrow: 1,
                      minWidth: "400px",
                    }}
                  >
                    Part of the <BranchName>{workspace.name}</BranchName>{" "}
                    <BranchName>{stats.number_cases} cases</BranchName>{" "}
                    <BranchName>{stats.number_events} events</BranchName>
                  </Text>
                  <LabelGroup
                    sx={{ flexShrink: 1 }}
                    overflowStyle="overlay"
                    visibleChildCount={3}
                  >
                    {explanation?.final_event_log_columns.map((column) => (
                      <Label variant="success">
                        {column.value.display_name}:{" "}
                        {formatLabelValue(column.value)}
                      </Label>
                    ))}
                  </LabelGroup>
                </PageHeader.Description>
                <PageHeader.Navigation>
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
                      counter={stats.number_variants}
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
                      counter={
                        aggregate._successors[aggregate._initial_tree_id]
                          ?.length
                      }
                      icon={ChecklistIcon}
                    >
                      Aggregates
                    </UnderlineNav.Item>
                    <UnderlineNav.Item
                      icon={ColumnsIcon}
                      as={NavLink}
                      counter={aggregate.data.columns.length}
                      to={`/workspace/${workspace.id}/${aggregate._identifier}/columns`}
                    >
                      Fields
                    </UnderlineNav.Item>
                  </UnderlineNav>
                </PageHeader.Navigation>
              </PageHeader>
            </SplitPageLayout.Header>
            <SplitPageLayout.Pane
              divider={"line"}
              aria-label="Navigation"
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
              <Outlet />
            </SplitPageLayout.Content>
          </SplitPageLayout>
        </AggregateContext.Provider>
      </BaseStyles>
    </ThemeProvider>
  );
}
