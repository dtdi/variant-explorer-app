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
} from "@primer/react";
import { PageHeader } from "@primer/react/experimental";
import {
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
import { Outlet, Link as RouterLink, NavLink } from "react-router-dom";
import Blank from "../components/blank";

import { useLoaderData, useNavigate } from "react-router-dom";

export async function loader({ params }) {
  // fake async call and return data
  const aggregate = {
    process_id: 1,
    uuid: "d68b49ba-1c09-4b01-8bf7-2d586798db25",
    name: "Aggregate 1",
    display_name: "Aggregate 1",
    description: "This is aggregate 1",
    parent: null,
    grouped_by: ["case:concept:name"],
    aspect: "performance",
    createdAt: "2022-03-28T13:13:41.042530+00:00",
    number_cases: 111,
    number_events: 312312,
    number_children: 2,
    features: [],
  };
  return new Promise((resolve) => setTimeout(resolve({ aggregate }), 300));
}

export default function AggregateRoot() {
  const { aggregate } = useLoaderData();

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
                  <PageHeader.Title>{aggregate.name}</PageHeader.Title>
                  <PageHeader.Actions>
                    <IconButton aria-label="Workflows" icon={WorkflowIcon} />
                    <IconButton aria-label="Insights" icon={GraphIcon} />
                    <Button variant="primary" trailingVisual={TriangleDownIcon}>
                      Add Item
                    </Button>
                    <IconButton aria-label="Settings" icon={GearIcon} />
                  </PageHeader.Actions>
                </PageHeader.TitleArea>

                <PageHeader.Navigation>
                  <UnderlineNav aria-label="Process Overview">
                    <UnderlineNav.Item
                      as={NavLink}
                      to={`/process/${aggregate.process_id}/map`}
                      icon={WorkflowIcon}
                      counter="12"
                    >
                      Process Map
                    </UnderlineNav.Item>
                  </UnderlineNav>
                </PageHeader.Navigation>
              </PageHeader>
            </PageLayout.Header>
            <PageLayout.Content>
              <Outlet />
            </PageLayout.Content>
            <PageLayout.Pane position={"start"}>
              {" "}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Text
                    sx={{
                      fontSize: 0,
                      fontWeight: "bold",
                      display: "block",
                      color: "fg.muted",
                    }}
                  >
                    Assignees
                  </Text>
                  <Text
                    sx={{
                      fontSize: 0,
                      color: "fg.muted",
                      lineHeight: "condensed",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    No one —
                    <Button
                      variant="invisible"
                      onClick={() => {
                        alert("Assign yourself");
                      }}
                      sx={{ color: "fg.muted" }}
                    >
                      assign yourself
                    </Button>
                  </Text>
                </Box>
                <Box
                  role="separator"
                  sx={{
                    width: "100%",
                    height: 1,
                    backgroundColor: "border.default",
                  }}
                ></Box>
                <Box>
                  <Text
                    sx={{
                      fontSize: 0,
                      fontWeight: "bold",
                      display: "block",
                      color: "fg.muted",
                    }}
                  >
                    Labels
                  </Text>
                  <Text
                    sx={{
                      fontSize: 0,
                      color: "fg.muted",
                      lineHeight: "condensed",
                    }}
                  >
                    None yet
                  </Text>
                </Box>
              </Box>
            </PageLayout.Pane>
            <PageLayout.Pane position={"end"}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Text
                    sx={{
                      fontSize: 0,
                      fontWeight: "bold",
                      display: "block",
                      color: "fg.muted",
                    }}
                  >
                    Assignees
                  </Text>
                  <Text
                    sx={{
                      fontSize: 0,
                      color: "fg.muted",
                      lineHeight: "condensed",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    No one —
                    <Button
                      variant="invisible"
                      onClick={() => {
                        alert("Assign yourself");
                      }}
                      sx={{ color: "fg.muted" }}
                    >
                      assign yourself
                    </Button>
                  </Text>
                </Box>
                <Box
                  role="separator"
                  sx={{
                    width: "100%",
                    height: 1,
                    backgroundColor: "border.default",
                  }}
                ></Box>
                <Box>
                  <Text
                    sx={{
                      fontSize: 0,
                      fontWeight: "bold",
                      display: "block",
                      color: "fg.muted",
                    }}
                  >
                    Labels
                  </Text>
                  <Text
                    sx={{
                      fontSize: 0,
                      color: "fg.muted",
                      lineHeight: "condensed",
                    }}
                  >
                    None yet
                  </Text>
                </Box>
              </Box>
            </PageLayout.Pane>
            <PageLayout.Footer></PageLayout.Footer>
          </PageLayout>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
