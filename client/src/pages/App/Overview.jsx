import {
  DownloadIcon,
  EyeIcon,
  KebabHorizontalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Button,
  FormControl,
  IconButton,
  Label,
  LabelGroup,
  RelativeTime,
  TextInput,
  Textarea,
} from "@primer/react";
import { Blankslate, DataTable, Table } from "@primer/react/drafts";
import { Dialog } from "@primer/react/experimental";
import { useState, createRef, useRef } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { Formik, Field, Form } from "formik";

export async function loader() {
  const processes = [
    {
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
      canDestroy: true,
      canDownload: true,
      canUpload: true,
      createdAt: "2022-03-28T13:13:18.047277+00:00",
      description: null,
      id: "1",
      name: "BPI",
    },
    {
      artefacts: [
        {
          createdAt: "2023-11-01T16:36:47.034371+00:00",
          description: "Period covered: January 2017 to April 2019",
          id: "2",
          modelType: null,
          name: "bpi_challenge_2019_sample",
          type: "evlog",
        },
      ],
      canDestroy: true,
      canDownload: true,
      canUpload: true,
      createdAt: "2023-11-01T16:36:17.991835+00:00",
      description: null,
      id: "2",
      name: "VariantExplain",
    },
    {
      artefacts: [
        {
          createdAt: "2023-11-06T21:13:04.180472+00:00",
          description: "Period covered: January 2023 to December 2023",
          id: "3",
          modelType: null,
          name: "export",
          type: "evlog",
        },
        {
          createdAt: "2023-11-07T09:39:40.962416+00:00",
          description: "Rebased Artefact",
          id: "4",
          modelType: null,
          name: "Rebased Artefact",
          type: "evlog",
        },
      ],
      canDestroy: true,
      canDownload: true,
      canUpload: true,
      createdAt: "2023-11-06T20:53:15.772103+00:00",
      description: null,
      id: "3",
      name: "Targenio",
    },
    {
      artefacts: [
        {
          createdAt: "2023-12-21T08:06:39.932790+00:00",
          description: "Period covered: January 2018 to January 2019",
          id: "5",
          modelType: null,
          name: "bpi_challenge_2019_sample",
          type: "evlog",
        },
      ],
      canDestroy: true,
      canDownload: true,
      canUpload: true,
      createdAt: "2023-12-21T08:06:17.080693+00:00",
      description: null,
      id: "4",
      name: "BPI 2019",
    },
  ];
  return { processes };
}

export default function AppOverview() {
  const { processes } = useLoaderData();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState({});
  const formRef = useRef();

  const add = () => {
    console.log("Add");
    setCurrentRow({});
    setEditDialogOpen(true);
  };

  const edit = (row) => {
    console.log("Edit", row);
    setCurrentRow(row);
    setEditDialogOpen(true);
  };

  const save = (row) => {
    console.log("Save", row);

    //setEditDialogOpen(false);
  };

  const askDelete = (row) => {
    console.log("Delete", row);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      {deleteDialogOpen && (
        <Dialog
          width="small"
          title={`Delete`}
          onClose={() => setDeleteDialogOpen(false)}
          footerButtons={[{ buttonType: "danger", content: "Delete" }]}
        >
          <p>Are you sure you want to delete {currentRow.name}?</p>
        </Dialog>
      )}
      {editDialogOpen && (
        <Dialog
          title={`Edit: ${currentRow.name}`}
          subtitle="Edit the workspace details"
          footerButtons={[
            {
              buttonType: "danger",
              disabled: !currentRow.canDestroy,
              content: `Delete`,
              onClick: () => askDelete(currentRow),
            },
            {
              buttonType: "primary",
              content: `Save changes`,
              onClick: () => {
                formRef.current.handleSubmit();
              },
            },
          ]}
          onClose={() => {
            setEditDialogOpen(false);
          }}
        >
          <Formik
            innerRef={formRef}
            initialValues={{
              name: currentRow.name || "",
              description: currentRow.description || "",
            }}
            onSubmit={(values) => {
              save(values);
            }}
          >
            <Form>
              <FormControl>
                <FormControl.Label>Name</FormControl.Label>
                <Field block="true" name="name" as={TextInput} />
                <FormControl.Caption>
                  Reference Name for the process
                </FormControl.Caption>
              </FormControl>
              <FormControl>
                <FormControl.Label>Description</FormControl.Label>
                <Field block="true" name="description" as={Textarea} />
                <FormControl.Caption>
                  Description of your process
                </FormControl.Caption>
              </FormControl>
              <FormControl>
                <FormControl.Label>Process ID</FormControl.Label>
                <TextInput
                  block="true"
                  value={currentRow.id}
                  monospace
                  disabled
                />
              </FormControl>
            </Form>
          </Formik>
          {currentRow?.artefacts?.length > 0 ? (
            <Table.Container>
              <Table.Title id="workspace" as="h2">
                Workspace Artefacts
              </Table.Title>

              <DataTable
                aria-labelledby="workspace"
                data={currentRow.artefacts}
                columns={[
                  { header: "Name", field: "name", rowHeader: true },

                  {
                    header: "Type",
                    field: "type",
                    renderCell: (row) => <Label>{row.type}</Label>,
                  },
                  {
                    header: "Created",
                    field: "createdAt",
                    renderCell: (row) => (
                      <RelativeTime date={new Date(row.createdAt)} />
                    ),
                  },
                  { header: "Description", field: "description" },

                  {
                    id: "actions",
                    header: () => <>Actions</>,
                    renderCell: (row) => {
                      return (
                        <ActionMenu>
                          <ActionMenu.Anchor>
                            <IconButton
                              aria-label={`Actions: ${row.name}`}
                              title={`Actions: ${row.name}`}
                              icon={KebabHorizontalIcon}
                              variant="invisible"
                            />
                          </ActionMenu.Anchor>
                          <ActionMenu.Overlay>
                            <ActionList>
                              <ActionList.Item
                                onSelect={() => {
                                  action("Copy")(row);
                                }}
                              >
                                Copy row
                              </ActionList.Item>
                              <ActionList.Item>Edit row</ActionList.Item>
                              <ActionList.Item>
                                Export row as CSV
                              </ActionList.Item>
                              <ActionList.Divider />
                              <ActionList.Item variant="danger">
                                Delete row
                              </ActionList.Item>
                            </ActionList>
                          </ActionMenu.Overlay>
                        </ActionMenu>
                      );
                    },
                  },
                ]}
              />
            </Table.Container>
          ) : (
            <Blankslate border>
              <Blankslate.Heading>Upload your log</Blankslate.Heading>
            </Blankslate>
          )}
        </Dialog>
      )}
      {processes.length ? (
        <Table.Container>
          <Table.Title id="workspaces" as="h2">
            Workspace
          </Table.Title>
          <Table.Actions>
            <Button variant="primary" onClick={add} trailingVisual={PlusIcon}>
              Add Workspace
            </Button>
          </Table.Actions>
          <Table.Subtitle>Your workspace projects</Table.Subtitle>
          <DataTable
            aria-labelledby="workspaces"
            data={processes}
            columns={[
              { header: "Name", field: "name", rowHeader: true },
              {
                header: "Created",
                field: "createdAt",
                renderCell: (row) => (
                  <RelativeTime date={new Date(row.createdAt)} />
                ),
              },
              { header: "Description", field: "description" },
              {
                header: "Artefacts",
                field: "artefacts",
                renderCell: (row) => {
                  return (
                    row.artefacts.length > 0 && (
                      <LabelGroup>
                        {row.artefacts.map((artefact) => (
                          <Label key={artefact.id}>{artefact.name}</Label>
                        ))}
                      </LabelGroup>
                    )
                  );
                },
              },

              {
                id: "actions",
                header: () => <>Actions</>,
                renderCell: (row) => {
                  return (
                    <>
                      <IconButton
                        icon={EyeIcon}
                        title={`View: ${row.name}`}
                        variant="invisible"
                        as={Link}
                        to={`/process/${row.id}`}
                      />
                      <IconButton
                        icon={PencilIcon}
                        title={`Edit: ${row.name}`}
                        variant="invisible"
                        onClick={() => {
                          edit(row);
                        }}
                      />
                    </>
                  );
                },
              },
            ]}
          />
        </Table.Container>
      ) : (
        <Blankslate border>
          <Blankslate.Visual>
            <BookIcon size="medium" />
          </Blankslate.Visual>
          <Blankslate.Heading>No Processes Available</Blankslate.Heading>
          <Blankslate.Description>
            Get started now by uploading your first!
          </Blankslate.Description>
          <Blankslate.PrimaryAction href="#">
            Upload or Import
          </Blankslate.PrimaryAction>
        </Blankslate>
      )}
    </>
  );
}
