import { useContext } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { GlobalContext } from "../../global-context";
import axios from "axios";

export async function loader() {
  const apiUrl = "http://localhost:41211";
  const settings = await axios.get(`${apiUrl}/settings`);
  console.log(settings);
  return { settings };
}

export default function AppSettings() {
  const { apiUrl } = useContext(GlobalContext);
  const navigate = useNavigate();

  const { settings } = useLoaderData();

  const save = async (settings) => {
    const res = await axios.post(`${apiUrl}/settings`, settings);
    navigate("/settings");
  };

  return <></>;
}
