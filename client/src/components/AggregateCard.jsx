import { ChevronRightIcon, PinIcon } from "@primer/octicons-react";
import {
  Box,
  BranchName,
  Button,
  Octicon,
  RelativeTime,
  Truncate,
} from "@primer/react";
import Markdown from "markdown-to-jsx";
import { Link, useNavigate } from "react-router-dom";
import { formatDuration, formatNumber } from "../utils";

export default function AggregateCard({ aggregate, onSelect }) {
  return (
    <div>
      <div className="card text-bg-light position-relative">
        <div className="card-body">
          <h5 className=" card-title">{aggregate.name}</h5>
          <h6 className="card-subtitle text-muted">
            {aggregate?.split?.description}
          </h6>
          <div className="card-text">
            <BranchName sx={{ mr: 1 }}>
              {formatNumber(aggregate.stats.fraction_total_cases * 100)}% of
              cases
            </BranchName>
            <BranchName sx={{ mr: 1 }}>
              {formatNumber(aggregate.stats.number_variants)} variants
            </BranchName>
            <BranchName sx={{ mr: 1 }}>
              {formatDuration(aggregate.stats.mean_duration)} avg duration
            </BranchName>
          </div>
          <p className="card-text">
            <Markdown>{aggregate.description}</Markdown>
          </p>
        </div>
        {aggregate.bookmark && (
          <div className="card-body text-bg-warning">
            <h6 className="card-subtitle">
              <Octicon sx={{ mr: 1 }} icon={PinIcon} />
              {aggregate.bookmark?.name}
            </h6>
            <Markdown>{aggregate.bookmark?.description}</Markdown>
          </div>
        )}
        <ul class="list-group list-group-flush">
          {aggregate?.explanation?.final_event_log_columns?.map((column) => (
            <li class="list-group-item d-flex justify-content-between flex-wrap">
              <span className="fw-semibold">{column.value.display_name}:</span>
              {column.value.display_as === "duration" ? (
                <span className="">{formatDuration(column.value.value)}</span>
              ) : (
                <span className="">{column.value.value}</span>
              )}
            </li>
          ))}
          {aggregate?.explanation?.final_columns?.map((column) => (
            <li class="list-group-item d-flex justify-content-between flex-wrap">
              <span className="fw-semibold">{column.value.display_name}:</span>
              <span className="">{column.value.value}</span>
            </li>
          ))}
        </ul>
        <div class="card-body">
          <Link
            className="card-link stretched-link"
            to={`/workspace/${aggregate.workspace_id}/${aggregate.id}`}
          >
            View Group <Octicon icon={ChevronRightIcon} />
          </Link>
        </div>
        <div className="card-footer text-body-secondary fw-light fs-6">
          created <RelativeTime date={new Date(aggregate.created_at)} />
        </div>
      </div>
    </div>
  );
}
