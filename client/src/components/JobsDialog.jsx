import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../global-context";
import { Dialog } from "@primer/react/drafts";
import { IconButton, RelativeTime } from "@primer/react";
import { BugIcon } from "@primer/octicons-react";

export default function JobsDialog() {
  const { jobs } = useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  console.log(open);
  return (
    <>
      <IconButton
        aria-label="Workspace Settings"
        icon={BugIcon}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <Dialog
          width="small"
          position={"right"}
          title={"Jobs"}
          subtitle={"Running Jobs in the Backend"}
          onClose={() => setOpen(false)}
        >
          {Object.values(jobs)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .map((job) => (
              <div key={job.job_id}>
                {job.job_name} -{" "}
                <RelativeTime date={new Date(job.created_at)} />{" "}
                {job.fulfillment} {job.status}
              </div>
            ))}
        </Dialog>
      )}
    </>
  );
}
