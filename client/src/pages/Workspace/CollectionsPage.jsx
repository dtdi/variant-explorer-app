import {
  ActionList,
  Box,
  BranchName,
  Button,
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
import { ApiContext } from "../../main";

export default function CollectionsPage() {
  const { workspace } = useContext(WorkspaceContext);
  const [collection, setCollection] = useState([]);
  useEffect(() => {
    setCollection(workspace.collection);
  }, [workspace]);

  const [loading, setLoading] = useState(false);

  const handleSave = async (values) => {
    setLoading(true);
    console.log(values);
    axios
      .post(`${apiUrl}/collections/editBookmark/${workspace.id}`, values)
      .then((res) => setCollection(res.data))
      .finally(() => setLoading(false));

    setLoading(false);
  };

  return <Box></Box>;
}
