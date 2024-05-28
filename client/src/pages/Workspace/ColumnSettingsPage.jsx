import {
  ActionList,
  Box,
  BranchName,
  Button,
  Checkbox,
  FormControl,
  Heading,
  Label,
  PageLayout,
  RadioGroup,
  Select,
  Text,
  TextInput,
  Textarea,
} from "@primer/react";

import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { RocketIcon } from "@primer/octicons-react";
import { WorkspaceContext } from "../../routes/WorkspaceRoot";
import { Field, Form, Formik } from "formik";
import { GlobalContext } from "../../global-context";

export async function loader({ params }) {
  const { workspaceId, aggregateId } = params;

  return { columns: [] };
}

export default function ColumnSettingsPage() {
  const { workspace } = useContext(WorkspaceContext);
  const [columns, setColumns] = useState([]); // [columns, setColumns
  const { apiUrl } = useContext(GlobalContext);
  useEffect(() => {
    setColumns(workspace.columns);
  }, [workspace]);

  const [loading, setLoading] = useState(false);

  const handleSave = async (values) => {
    setLoading(true);
    console.log(values);
    axios
      .post(`${apiUrl}/columns/editColumn/${workspace.id}`, values)
      .then((res) => setColumns(res.data))
      .finally(() => setLoading(false));

    setLoading(false);
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
      {columns
        .sort((a, b) => a.order - b.order)
        .map((column) => (
          <Box
            sx={{
              p: 3,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "border.default",
              borderRadius: 2,
              display: "flex",
              flexDirection: "row",
            }}
            key={column.id}
          >
            <Box sx={{ flex: 1 }}>
              <Heading as="h4">{column.display_name}</Heading>
              <BranchName as="div">{column.name}</BranchName>
              <Text as="p">{column.description}</Text>
            </Box>
            <Box sx={{ flex: 2 }}>
              <Formik
                initialValues={{
                  display_name: column.display_name,
                  event_log_column: column.event_log_column,
                  type: column.type,
                  id: column.id,
                  analysis_category: column.analysis_category,
                  description: column.description,
                  visible: column.visible,
                  order: column.order,
                }}
                onSubmit={(values) => {
                  handleSave(values);
                }}
              >
                <Box
                  as={Form}
                  sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}
                >
                  <FormControl>
                    <FormControl.Label>Display Name</FormControl.Label>
                    <Field
                      block="true"
                      size="large"
                      name="display_name"
                      as={TextInput}
                      trailingAction={<TextInput.Action icon={RocketIcon} />}
                    />
                  </FormControl>
                  <FormControl>
                    <FormControl.Label>Order</FormControl.Label>
                    <Field block="true" name="order" as={TextInput} />
                  </FormControl>
                  <FormControl>
                    <FormControl.Label>Visible</FormControl.Label>
                    <Field type="checkbox" name="visible" as={Checkbox} />
                  </FormControl>
                  <FormControl>
                    <FormControl.Label>Event Log Column</FormControl.Label>
                    <Field block="true" as={Select} name="event_log_column">
                      <Select.Option></Select.Option>
                      <Select.Option value="case_id">Case ID</Select.Option>
                      <Select.Option value="duration">Duration</Select.Option>
                      <Select.Option value="start_time">
                        Start Time
                      </Select.Option>
                      <Select.Option value="end_time">End Time</Select.Option>
                      <Select.Option value="finish_rate">
                        Finish Rate
                      </Select.Option>

                      <Select.Option value="service_time">
                        Service Time
                      </Select.Option>
                      <Select.Option value="waiting_time">
                        Waiting Time
                      </Select.Option>
                      <Select.Option value="sojourn_time">
                        Sojourn Time
                      </Select.Option>
                      <Select.Option value="length">Lenth</Select.Option>
                      <Select.Option value="variant">Variant</Select.Option>
                    </Field>
                  </FormControl>
                  <FormControl>
                    <FormControl.Label>Column Type</FormControl.Label>
                    <Field block="true" as={Select} name="type">
                      <Select.Option value=""></Select.Option>
                      <Select.Option value="string">Text</Select.Option>
                      <Select.Option value="numeric">Numeric</Select.Option>
                      <Select.Option value="timedelta">Timedelta</Select.Option>
                      <Select.Option value="bool">Boolean</Select.Option>
                      <Select.Option value="datetime">Datetime</Select.Option>

                      <Select.Option value="categorical">
                        Categorical
                      </Select.Option>
                    </Field>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label>Field Description</FormControl.Label>
                    <FormControl.Caption></FormControl.Caption>
                    <Field
                      rows="2"
                      as={Textarea}
                      block="true"
                      name="description"
                    />
                  </FormControl>
                  <Box sx={{ display: "flex" }}>
                    <Button disabled={loading} variant="primary" type="submit">
                      Save
                    </Button>
                    <Button
                      disabled={loading}
                      sx={{ marginLeft: 1 }}
                      variant="invisible"
                      type="reset"
                    >
                      Reset
                    </Button>
                  </Box>
                </Box>
              </Formik>
            </Box>
          </Box>
        ))}
    </Box>
  );
}
