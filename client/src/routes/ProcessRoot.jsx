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
import { Outlet, Link as RouterLink, NavLink } from "react-router-dom";
import Blank from "../components/blank";

import { useLoaderData, useNavigate } from "react-router-dom";

export async function loader({ params }) {
  // fake async call and return data
  const process = {
    artefacts: [
      {
        createdAt: "2022-03-28T13:13:41.042530+00:00",
        description: null,
        id: "1",
        modelType: null,
        name: "bpi_ch_2020_prepaidtravelcost",
        type: "evlog",
      },
    ],
    stats: {
      number_cases: 1231,
      number_aggregates: 12,
    },
    description: "asdfasas",
    id: "1",
    name: "BPI",
  };
  return new Promise((resolve) => setTimeout(resolve({ process }), 300));
}

export default function ProcessRoot() {
  const { process } = useLoaderData();

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
                  <PageHeader.Title>{process.name}</PageHeader.Title>
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
                      to="/process/1"
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
                      to={`/process/${process.id}/map`}
                      icon={WorkflowIcon}
                    >
                      Process Map
                    </UnderlineNav.Item>
                    <UnderlineNav.Item
                      as={NavLink}
                      to={`/process/${process.id}/cases`}
                      counter={process.stats.number_cases}
                      icon={BriefcaseIcon}
                    >
                      Cases
                    </UnderlineNav.Item>
                    <UnderlineNav.Item
                      as={NavLink}
                      to={`/process/${process.id}/aggregates`}
                      counter={process.stats.number_aggregates}
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
