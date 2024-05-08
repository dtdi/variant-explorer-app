import { useRef, useState } from "react";
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
} from "@primer/react";
import { Hidden, PageHeader } from "@primer/react/experimental";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  ChecklistIcon,
  CommentDiscussionIcon,
  CommitIcon,
  FileDiffIcon,
  GearIcon,
  GraphIcon,
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
import Blank from "../components/blank";

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

  const { workspace, aggregate } = await fetch(
    `${apiUrl}/workspaces/getWorkspace/${workspaceId}/${aggregateId}`
  ).then((res) => res.json());

  return { workspace, aggregate };
}

export default function WorkspaceRoot() {
  const { workspace, aggregate } = useLoaderData();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const returnFocusRef = useRef(null);
  const navigate = useNavigate();

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
          <PageLayout containerWidth="full">
            <PageLayout.Header>
              <PageHeader>
                <PageHeader.ContextArea>
                  <PageHeader.ParentLink href="/">Home</PageHeader.ParentLink>
                </PageHeader.ContextArea>
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
                  <PageHeader.Title>{workspace.name}</PageHeader.Title>
                  <PageHeader.Actions>
                    <IconButton aria-label="Workflows" icon={WorkflowIcon} />
                    <IconButton aria-label="Insights" icon={GraphIcon} />
                    <Button variant="primary" trailingVisual={TriangleDownIcon}>
                      Add Item
                    </Button>
                    <IconButton aria-label="Settings" icon={GearIcon} />
                  </PageHeader.Actions>
                </PageHeader.TitleArea>
                <PageHeader.Description>
                  <Text sx={{ fontSize: 1, color: "fg.muted" }}>
                    <Link
                      as={RouterLink}
                      to="/workspace/1"
                      sx={{ fontWeight: "bold" }}
                    >
                      broccolinisoup
                    </Link>{" "}
                    wants to merge 3 commits into{" "}
                    <BranchName href="https://github.com/primer/react">
                      main
                    </BranchName>{" "}
                    from{" "}
                    <BranchName href="https://github.com/primer/react">
                      bs/pageheader-title
                    </BranchName>
                  </Text>
                </PageHeader.Description>
                <PageHeader.Navigation>
                  <UnderlineNav aria-label="Process Overview">
                    <UnderlineNav.Item
                      as={NavLink}
                      to={`/process/${workspace.id}/map`}
                      icon={WorkflowIcon}
                    >
                      Process Map
                    </UnderlineNav.Item>
                    <UnderlineNav.Item
                      as={NavLink}
                      to={`/process/${workspace.id}/cases`}
                      counter={workspace.stats?.number_cases}
                      icon={BriefcaseIcon}
                    >
                      Cases
                    </UnderlineNav.Item>
                    <UnderlineNav.Item
                      as={NavLink}
                      to={`/process/${workspace.id}/aggregates`}
                      counter={workspace.stats?.number_aggregates}
                      icon={ChecklistIcon}
                    >
                      Aggregates
                    </UnderlineNav.Item>
                  </UnderlineNav>
                </PageHeader.Navigation>
              </PageHeader>
            </PageLayout.Header>
            <Outlet />
          </PageLayout>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
