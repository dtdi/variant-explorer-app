import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ThemeProvider,
  BaseStyles,
  Box,
  UnderlineNav,
  Text,
  IconButton,
  BranchName,
  Breadcrumbs,
  SplitPageLayout,
  Heading,
  Label,
  LabelGroup,
  FormControl,
  TextInput,
  Textarea,
  ActionMenu,
  ActionList,
} from "@primer/react";
import { Dialog, PageHeader } from "@primer/react/experimental";
import {
  BriefcaseIcon,
  ChecklistIcon,
  ColumnsIcon,
  CommentDiscussionIcon,
  DownloadIcon,
  FoldUpIcon,
  GearIcon,
  PencilIcon,
  PinIcon,
  PinSlashIcon,
  RepoIcon,
  TrashIcon,
  WorkflowIcon,
} from "@primer/octicons-react";
import {
  Outlet,
  Link as RouterLink,
  NavLink,
  redirect,
  useRevalidator,
  useMatch,
} from "react-router-dom";
import TreeNavigation from "../components/Navigation/TreeNavigation";

import { useLoaderData, useNavigate } from "react-router-dom";
import axios from "axios";
import { formatDuration, formatNumber } from "../utils";
import { Field, Form, Formik } from "formik";
import { GlobalContext } from "../global-context";
import JobsDialog from "../components/JobsDialog";

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
  const { apiUrl, addToast, isLoading, setIsLoading } =
    useContext(GlobalContext);

  const [aggregateEditDialogOpen, setAggregateEditDialogOpen] = useState(false);
  const editFormRef = useRef();
  const bookmarkFormRef = useRef();
  const toggleAggregateEditDialogOpen = () =>
    setAggregateEditDialogOpen(!aggregateEditDialogOpen);
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const toggleBookmarkDialogOpen = () =>
    setBookmarkDialogOpen(!bookmarkDialogOpen);

  const { workspace, aggregate, stats, breadcrumbs, explanation } =
    useLoaderData();

  const [bookmark, setBookmark] = useState({});

  useEffect(() => {
    if (aggregate?.data?.bookmark_id) {
      axios
        .get(`${apiUrl}/collections/getBookmark/${aggregate.data.bookmark_id}`)
        .then((res) => {
          setBookmark(res.data.bookmark);
        });
    }
  }, [aggregate]);

  const deleteAggregate = async () => {
    setIsLoading(true);
    axios
      .delete(`${apiUrl}/aggregates/deleteAggregate/${aggregate._identifier}`)
      .then((res) => {
        navigate(`/workspace/${workspace.id}/${res.data.parent_id}`);
        addToast("Group deleted", "The group has been deleted", "success");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const deleteSplit = async () => {
    setIsLoading(true);
    axios
      .delete(`${apiUrl}/aggregates/deleteSplit/${aggregate.data?.split?.id}`)
      .then((res) => {
        navigate(`/workspace/${workspace.id}/${res.data.parent_id}`);
        addToast("Split deleted", "The split has been deleted", "success");
      })
      .catch((err) => {
        addToast(
          "Error",
          "An error occurred while deleting the split",
          "error"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteChildren = async () => {
    setIsLoading(true);

    axios
      .delete(`${apiUrl}/aggregates/deleteChildren/${aggregate._identifier}`)
      .then((res) => {
        revalidator.revalidate();
        addToast(
          "Children deleted",
          "All children of this group have been deleted",
          "success"
        );
      })
      .catch((err) => {
        addToast("Error", "An error occurred while deleting children", "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const saveBookmarkForm = async (updatedBookmark) => {
    const res = await axios.post(
      `${apiUrl}/collections/editBookmark`,
      updatedBookmark
    );
    setBookmarkDialogOpen(false);
    revalidator.revalidate();
  };

  const saveAggregateForm = async (updatedAggregate) => {
    setIsLoading(true);
    axios
      .post(`${apiUrl}/aggregates/editAggregate`, updatedAggregate)
      .then((res) => {
        addToast("Group updated", "The group has been updated", "success");
      })
      .catch((err) => {
        addToast(
          "Error",
          "An error occurred while updating the group",
          "error"
        );
      })
      .finally(() => {
        setIsLoading(false);
        setAggregateEditDialogOpen(false);
        revalidator.revalidate();
      });
  };

  const formatLabelValue = (value) => {
    if (value.display_as === "duration") {
      return formatDuration(value.value);
    }
    if (value.display_as === "number") {
      return formatNumber(value.value);
    }
    return value.value;
  };

  const navigate = useNavigate();
  const revalidator = useRevalidator();

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
                    href="/"
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
                        navigate(`/workspace/collections/${workspace.id}`);
                      }}
                    />

                    <IconButton
                      aria-label="Workspace Settings"
                      icon={GearIcon}
                      onClick={() => {
                        navigate(`/workspace/settings/${workspace.id}`);
                      }}
                    />
                    <JobsDialog />
                  </PageHeader.ContextAreaActions>
                </PageHeader.ContextArea>
                <PageHeader.TitleArea
                  sx={{ p: 3, pt: 0, pb: 0, alignItems: "center" }}
                >
                  <PageHeader.Title>{aggregate.data.name}</PageHeader.Title>
                  <PageHeader.TrailingAction>
                    <IconButton
                      onClick={toggleAggregateEditDialogOpen}
                      icon={PencilIcon}
                      aria-label="Rename Group"
                      variant="invisible"
                    />
                  </PageHeader.TrailingAction>

                  <PageHeader.Actions>
                    {bookmarkDialogOpen && (
                      <Dialog
                        title="Bookmark and Comment"
                        subtitle="Bookmark this group to easily access it later"
                        onClose={toggleBookmarkDialogOpen}
                        footerButtons={[
                          {
                            buttonType: "primary",
                            content: "Save",
                            onClick: () => {
                              bookmarkFormRef.current.submitForm();
                            },
                          },
                        ]}
                      >
                        <Formik
                          innerRef={bookmarkFormRef}
                          initialValues={{
                            name: bookmark.name || "",
                            description: bookmark.description || "",
                            workspace_id: workspace.id,
                            aggregate_id: aggregate._identifier,
                            id: bookmark.id,
                          }}
                          onSubmit={(values) => {
                            saveBookmarkForm(values);
                          }}
                        >
                          <Form>
                            <FormControl>
                              <FormControl.Label>Name</FormControl.Label>
                              <Field block="true" name="name" as={TextInput} />
                              <FormControl.Caption>Name</FormControl.Caption>
                            </FormControl>
                            <FormControl>
                              <FormControl.Label>Description</FormControl.Label>
                              <Field
                                block="true"
                                name="description"
                                as={Textarea}
                              />
                              <FormControl.Caption>
                                Description of your group
                              </FormControl.Caption>
                            </FormControl>
                          </Form>
                        </Formik>
                      </Dialog>
                    )}
                    {!aggregate.data.bookmark_id ? (
                      <IconButton
                        aria-label="Bookmark this group"
                        variant="default"
                        icon={PinIcon}
                        onClick={toggleBookmarkDialogOpen}
                      />
                    ) : (
                      <IconButton
                        aria-label="Remove Bookmark for this group"
                        icon={PinSlashIcon}
                        onClick={toggleBookmarkDialogOpen}
                      />
                    )}

                    <ActionMenu>
                      <ActionMenu.Button>Edit</ActionMenu.Button>
                      <ActionMenu.Overlay>
                        <ActionList.Item
                          variant="danger"
                          onSelect={deleteChildren}
                        >
                          <ActionList.LeadingVisual>
                            <TrashIcon />
                          </ActionList.LeadingVisual>
                          Delete Children
                        </ActionList.Item>
                        <ActionList.Item
                          variant="danger"
                          onSelect={deleteAggregate}
                        >
                          <ActionList.LeadingVisual>
                            <TrashIcon />
                          </ActionList.LeadingVisual>
                          Delete Group
                        </ActionList.Item>
                        <ActionList.Divider />
                        <ActionList.Item
                          variant="danger"
                          onSelect={deleteSplit}
                        >
                          <ActionList.LeadingVisual>
                            <TrashIcon />
                          </ActionList.LeadingVisual>
                          Delete Split
                        </ActionList.Item>
                      </ActionMenu.Overlay>
                    </ActionMenu>

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
                    <BranchName>
                      {stats.number_cases} (
                      {formatNumber(stats.fraction_total_cases * 100, 1)}%)
                      cases
                    </BranchName>{" "}
                    <BranchName>
                      {stats.number_events} (
                      {formatNumber(stats.fraction_total_events * 100, 1)}
                      %) events
                    </BranchName>
                  </Text>
                  <LabelGroup
                    sx={{ flexShrink: 1 }}
                    overflowStyle="overlay"
                    visibleChildCount={3}
                  >
                    {explanation?.final_event_log_columns.map((column) => (
                      <Label key={column.value.display_name} variant="success">
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
                      aria-current={
                        useMatch("/workspace/:workspaceId/:aggregateId/")
                          ? "page"
                          : undefined
                      }
                    >
                      Overview
                    </UnderlineNav.Item>
                    <UnderlineNav.Item
                      as={NavLink}
                      to={`/workspace/${workspace.id}/${aggregate._identifier}/aggregates`}
                      counter={
                        aggregate._successors[aggregate._initial_tree_id]
                          ?.length
                      }
                      icon={ChecklistIcon}
                      aria-current={
                        useMatch(
                          "/workspace/:workspaceId/:aggregateId/aggregates"
                        )
                          ? "page"
                          : undefined
                      }
                    >
                      Aggregates
                    </UnderlineNav.Item>
                    <UnderlineNav.Item
                      as={NavLink}
                      to={`/workspace/${workspace.id}/${aggregate._identifier}/diagram`}
                      counter={stats.number_variants}
                      icon={WorkflowIcon}
                      aria-current={
                        useMatch("/workspace/:workspaceId/:aggregateId/diagram")
                          ? "page"
                          : undefined
                      }
                    >
                      Process Map
                    </UnderlineNav.Item>
                    <UnderlineNav.Item
                      as={NavLink}
                      to={`/workspace/${workspace.id}/${aggregate._identifier}/cases`}
                      counter={stats.number_cases}
                      icon={BriefcaseIcon}
                      aria-current={
                        useMatch("/workspace/:workspaceId/:aggregateId/cases")
                          ? "page"
                          : undefined
                      }
                    >
                      Cases
                    </UnderlineNav.Item>

                    <UnderlineNav.Item
                      icon={ColumnsIcon}
                      as={NavLink}
                      counter={aggregate.data.columns.length}
                      to={`/workspace/${workspace.id}/${aggregate._identifier}/columns`}
                      aria-current={
                        useMatch("/workspace/:workspaceId/:aggregateId/columns")
                          ? "page"
                          : undefined
                      }
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
                  onClick={() => navigate(`/workspace/${workspace.id}/root/`)}
                >
                  Back to Root Aggregate
                </IconButton>
                <Heading as="h2" sx={{ fontSize: 16, marginLeft: 1 }}>
                  Aggregates
                </Heading>
              </Box>
              <TreeNavigation up={3} />
            </SplitPageLayout.Pane>
            <SplitPageLayout.Content padding="condensed" width="full">
              {aggregateEditDialogOpen && (
                <Dialog
                  title="Edit Aggregate"
                  onClose={toggleAggregateEditDialogOpen}
                  footerButtons={[
                    {
                      buttonType: "primary",
                      content: "Save",
                      onClick: () => {
                        editFormRef.current.submitForm();
                      },
                    },
                  ]}
                >
                  <Formik
                    innerRef={editFormRef}
                    initialValues={{
                      name: aggregate.data.name || "",
                      description: aggregate.data.description || "",
                      workspace_id: workspace.id,
                      aggregate_id: aggregate._identifier,
                    }}
                    onSubmit={(values) => {
                      saveAggregateForm(values);
                    }}
                  >
                    <Form>
                      <FormControl>
                        <FormControl.Label>Name</FormControl.Label>
                        <Field block="true" name="name" as={TextInput} />
                        <FormControl.Caption>Name</FormControl.Caption>
                      </FormControl>
                      <FormControl>
                        <FormControl.Label>Description</FormControl.Label>
                        <Field block="true" name="description" as={Textarea} />
                        <FormControl.Caption>
                          Description of your group
                        </FormControl.Caption>
                      </FormControl>
                    </Form>
                  </Formik>
                </Dialog>
              )}

              <Outlet />
            </SplitPageLayout.Content>
          </SplitPageLayout>
        </AggregateContext.Provider>
      </BaseStyles>
    </ThemeProvider>
  );
}
