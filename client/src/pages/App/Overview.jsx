import {
  BookIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
} from "@primer/octicons-react";
import {
  ActionList,
  Box,
  Button,
  Flash,
  FormControl,
  Heading,
  IconButton,
  Label,
  RelativeTime,
  Text,
  TextInput,
  Textarea,
  Truncate,
} from "@primer/react";
import { Blankslate, DataTable, Table } from "@primer/react/drafts";
import { Dialog } from "@primer/react/experimental";
import { useState, createRef, useRef, useContext } from "react";
import { Link, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import axios from "axios";
import { GlobalContext } from "../../global-context";

export async function loader() {
  const apiUrl = "http://localhost:41211";
  const workspaces = await fetch(`${apiUrl}/workspaces/getWorkspaces`).then(
    (res) => res.json()
  );
  return { workspaces };
}

export default function AppOverview() {
  const { apiUrl } = useContext(GlobalContext);
  const navigate = useNavigate();

  const { workspaces } = useLoaderData();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState({});
  const formRef = useRef();

  const add = () => {
    setCurrentRow({});
    setEditDialogOpen(true);
  };

  const edit = (row) => {
    setCurrentRow(row);
    setEditDialogOpen(true);
  };

  const save = async (updatedWorkspace) => {
    const res = await axios.post(
      `${apiUrl}/workspaces/editWorkspace`,
      updatedWorkspace
    );
    setEditDialogOpen(false);
    navigate("/");
  };

  const initLog = async (row) => {
    console.log("initialize log" + row.id, row);
    const res = await axios.post(`${apiUrl}/workspaces/initLog`, row);
  };

  const askDelete = (row) => {
    setDeleteDialogOpen(true);
  };

  const deleteWorkspace = async (row) => {
    const res = await axios.post(`${apiUrl}/workspaces/deleteWorkspace`, row);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    navigate("/");
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 3 }}>
      <Box
        sx={{
          p: 3,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "border.default",
          borderRadius: 2,
        }}
      >
        <h4>Variant Explorer</h4>
        <Text as="p" className="">
          A tool for visualy analysing you process mining data. ExploreLog is a
          web application designed for exploring and analyzing process mining
          event logs. It offers tools to visualize and examine process data,
          helping users identify inefficiencies and improve workflow operations.
        </Text>
      </Box>
      <Box>
        {deleteDialogOpen && (
          <Dialog
            width="small"
            title={`Delete`}
            onClose={() => setDeleteDialogOpen(false)}
            footerButtons={[
              {
                buttonType: "danger",
                content: "Delete",
                onClick: () => {
                  deleteWorkspace(currentRow);
                },
              },
            ]}
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
                disabled: !currentRow.can_delete,
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
                id: currentRow.id,
                log_name: currentRow.log_name || "",
                log_file: currentRow.log_file || "",
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
                  <Field
                    block="true"
                    as={TextInput}
                    name="id"
                    monospace
                    disabled
                  />
                </FormControl>
                <FormControl>
                  <FormControl.Label>Log Name</FormControl.Label>
                  <Field block="true" name="log_name" as={TextInput} />
                </FormControl>
                <FormControl>
                  <FormControl.Label>Log File Location</FormControl.Label>
                  <Field block="true" name="log_file" as={TextInput} />
                </FormControl>
              </Form>
            </Formik>
          </Dialog>
        )}
        {workspaces.length ? (
          <Table.Container>
            <Table.Title id="workspaces" as="h2">
              Workspaces
            </Table.Title>
            <Table.Actions>
              <Button variant="primary" onClick={add} trailingVisual={PlusIcon}>
                Add Workspace
              </Button>
            </Table.Actions>
            <Table.Subtitle>
              Your projects are organized in individual workspaces. You can
              create new ones.
            </Table.Subtitle>
            <DataTable
              aria-labelledby="workspaces"
              data={workspaces}
              columns={[
                { header: "Name", field: "name", rowHeader: true },
                {
                  header: "Created",
                  field: "created_at",
                  renderCell: (row) => (
                    <RelativeTime date={new Date(row.created_at)} />
                  ),
                },
                {
                  header: "Description",
                  field: "description",
                  renderCell: (row) => (
                    <Truncate maxWidth={230}>{row.description}</Truncate>
                  ),
                },
                {
                  header: "Log",
                  field: "Log",
                  renderCell: (row) => {
                    return row.log_name && <Label>{row.log_name}</Label>;
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
                          to={`/workspace/${row.id}`}
                        />
                        <IconButton
                          icon={PlayIcon}
                          title={`Start Processing: ${row.name}`}
                          variant="invisible"
                          onClick={() => {
                            initLog(row);
                          }}
                        />
                        {row.can_edit && (
                          <IconButton
                            icon={PencilIcon}
                            title={`Edit: ${row.name}`}
                            variant="invisible"
                            onClick={() => {
                              edit(row);
                            }}
                          />
                        )}
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
      </Box>
    </Box>
  );
}
