import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

export const globalDefaultState = {
  apiUrl: "http://localhost:41211",
  toasts: [],
  addToast: (title, body, variant) => {},
  removeToast: (id) => {},
  jobs: {},
  fetchJobs: () => {},
  isLoading: false,
  setIsLoading: (value) => {},
  toggleLoading: () => {},
};

export const GlobalContext = React.createContext({ globalDefaultState });

export const GlobalStateProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const [jobs, setJobs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const timerIdRef = useRef(null);

  useEffect(() => {
    const pollingCallback = () => {
      // Your polling logic here
      console.log("Polling...");

      axios
        .get(`${globalState.apiUrl}/jobs`)
        .then((res) => {
          setJobs(res.data);
        })
        .catch((error) => {
          console.log("Error polling: ", error);
          setIsPollingEnabled(false);
        });
    };

    const startPolling = () => {
      // pollingCallback(); // To immediately start fetching data
      // Polling every 30 seconds
      timerIdRef.current = setInterval(pollingCallback, 5000);
    };

    const stopPolling = () => {
      clearInterval(timerIdRef.current);
    };

    if (isPollingEnabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isPollingEnabled]);

  const addToast = (title, body, variant) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(toasts.concat({ id, title, body, variant: variant || "info" }));
  };
  const removeToast = (id) => {
    setToasts(toasts.filter((toast) => toast.id !== id));
  };

  const [globalState, setState] = useState({
    apiUrl: "http://localhost:41211",
  });
  return (
    <GlobalContext.Provider
      value={{
        jobs,
        toasts,
        addToast,
        removeToast,
        isLoading,
        setIsLoading,
        ...globalState,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
