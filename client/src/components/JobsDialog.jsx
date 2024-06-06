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
          width="medium"
          position={"right"}
          title={"Jobs"}
          subtitle={"Running Jobs in the Backend"}
          onClose={() => setOpen(false)}
        >
          <div className="list-group">
            {Object.values(jobs)
              .sort((a, b) => b.created_at.localeCompare(a.created_at))
              .map((job) => (
                <div className="list-group-item" key={job.job_id}>
                  <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{job.job_name}</h5>
                  </div>
                  <p class="mb-1">
                    {job.fulfillment} {job.status}
                  </p>
                  <small class="text-body-secondary">
                    <RelativeTime date={new Date(job.created_at)} />
                  </small>
                </div>
              ))}
          </div>
        </Dialog>
      )}
    </>
  );
}
