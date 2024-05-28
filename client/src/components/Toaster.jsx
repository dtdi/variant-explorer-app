import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../global-context";
import { Toast, ToastContainer } from "react-bootstrap";

export default function Toaster() {
  const { toasts, removeToast } = useContext(GlobalContext);

  return (
    <ToastContainer
      style={{ position: "fixed", margin: "20px" }}
      position="bottom-end"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          bg={toast.variant || "info"}
          autohide={toast.autohide || true}
          delay={toast.delay || 5000}
          onClose={() => removeToast(toast.id)}
        >
          <Toast.Header>
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body>{toast.body}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}
