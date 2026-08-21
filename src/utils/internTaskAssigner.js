/**
 * Determines who assigned an intern task.
 *
 * Logic:
 *  - assigned_by is null          → self created by intern
 *  - assigned_by set + is_admin   → assigned by admin
 *  - assigned_by set + !is_admin  → assigned by mentor (employee)
 *
 * @param {object} task - InternTask object from API
 * @returns {{ label: string, color: string, bg: string }}
 */
export function getAssignerType(task) {
  if (!task.assigned_by) {
    return {
      type:  "self",
      label: "Self",
      color: "text-purple-700",
      bg:    "bg-purple-100",
    };
  }

  if (task.assigner?.is_admin) {
    return {
      type:  "admin",
      label: "Admin",
      color: "text-red-700",
      bg:    "bg-red-100",
    };
  }

  return {
    type:  "mentor",
    label: "Mentor",
    color: "text-blue-700",
    bg:    "bg-blue-100",
  };
}

/**
 * Returns assigner display name with type badge info.
 * "Self" when null, otherwise the assigner's name.
 *
 * @param {object} task
 * @returns {string}
 */
export function getAssignerName(task) {
  if (!task.assigned_by) return "Self";
  return task.assigner?.name || "—";
}