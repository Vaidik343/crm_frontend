const colorMap = {
  //task status

  open: "primary",
  ongoing: "warning",
  closed: "success",

  //call type
  inquiry: "info",
  request: "secondary",
  complaint: "danger",

  //receive type
  call: "primary",
  msg: "secondary",
  email: "info",
  meeting: "warning",

  //
  active: "success",
  inactive: "Secondary",
};

const Badge = ({value, overrideColor}) => {
  const color = overrideColor || colorMap[value?.toLowerCase()] || "secondary";

  return (
    <span className={`badge bg-${color} text-capitalize`}>
      {value}
    </span>
  );
}

export const DueDateBadge = ({ dueDate }) => {
  if (!dueDate) return <span className="text-muted small">No due date</span>;

  const now = new Date();
  // parse date as local midnight, not UTC
  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day, 23, 59, 59); // end of due day

  const diffMs  = due - now;
  const diffHrs = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) {
    // past due date
    return <span className="badge bg-danger">Overdue</span>;
  }

  if (diffHrs <= 48) {
    // within 48 hours
    return (
      <span className="badge bg-danger">
        Due in {Math.ceil(diffHrs)}h
      </span>
    );
  }

  // normal — show date
  return (
    <span className="badge bg-light text-dark border">
      {new Date(year, month - 1, day).toLocaleDateString()}
    </span>
  );
};

export default Badge;