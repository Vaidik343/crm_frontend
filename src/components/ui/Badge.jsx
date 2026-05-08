const colorMap = {
  // task status
  open:       "primary",
  ongoing:    "warning",
  closed:     "success",
  // call type
  inquiry:    "info",
  request:    "secondary",
  complaint:  "danger",
  // receive type
  call:       "primary",
  msg:        "secondary",
  email:      "info",
  meeting:    "warning",
  // general
  active:     "success",
  inactive:   "secondary",
};

const Badge = ({ value, overrideColor }) => {
  const color = overrideColor || colorMap[value?.toLowerCase()] || "secondary";
  return (
    <span className={`badge bg-${color} text-capitalize`}>
      {value}
    </span>
  );
};

// Due date warning badge — turns red when <= 48 hours remaining
export const DueDateBadge = ({ dueDate }) => {
  if (!dueDate) return <span className="text-muted small">No due date</span>;

  const now      = new Date();
  const due      = new Date(dueDate);
  const diffMs   = due - now;
  const diffHrs  = diffMs / (1000 * 60 * 60);
  const isUrgent = diffHrs <= 48 && diffHrs > 0;
  const isOverdue = diffMs < 0;

  if (isOverdue) {
    return (
      <span className="badge bg-danger">
        ⚠ Overdue
      </span>
    );
  }

  if (isUrgent) {
    return (
      <span className="badge bg-danger">
        ⚠ Due in {Math.ceil(diffHrs)}h
      </span>
    );
  }

  return (
    <span className="badge bg-light text-dark border">
      {due.toLocaleDateString()}
    </span>
  );
};

export default Badge;