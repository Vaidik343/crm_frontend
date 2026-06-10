# Make CRM Application Responsive
The user requested a plan to fix the responsiveness of the application, particularly emphasizing that the mobile "card design" looks good but responsiveness is either missing across many pages or poorly implemented.
## Issue Analysis
Currently, some pages attempt responsiveness using a mix of Bootstrap (`d-none`, `d-md-block`) and Tailwind CSS (`hidden`, `md:block`), leading to inconsistent behavior. Additionally, while a mobile card design was introduced in some tables (like `Tasks.jsx` and `MyTasks.jsx`), it is completely absent in other key views (like `Calls.jsx`, `Projects.jsx`, `Employees.jsx`, etc.), forcing horizontal scrolling on mobile devices instead of an optimized mobile view.
## Open Questions
> [!IMPORTANT]
> 1. Should we apply this card-based mobile view to **all** data tables in the app (e.g. `Calls`, `Projects`, `Employees`, `Permissions`, `WorkLogs`)? 
> 2. Are there any specific pages you want prioritized first for responsiveness?
## Proposed Changes
We will standardize responsiveness using Tailwind CSS across all pages containing tables and complex layouts.
### 1. Standardize Hidden Utility Classes
Replace all legacy Bootstrap utility classes with Tailwind CSS equivalents across the project.
- **[MODIFY]** `src/pages/admin/Tasks.jsx` (Remove `d-none`, `d-md-block`, etc.)
- **[MODIFY]** `src/pages/employee/MyTasks.jsx` (Clean up any remaining)
### 2. Implement Mobile Card Layouts for All Tables
For every page containing a large data table, we will implement the `hidden md:block` class on the desktop table wrapper and introduce a `md:hidden flex flex-col space-y-4` wrapper containing the mobile card representations of that data.
- **[MODIFY]** `src/pages/admin/Calls.jsx` 
  - Hide the table on `md` and below.
  - Implement a mobile card layout showing the Caller, Employee, Type flags, and Actions.
- **[MODIFY]** `src/pages/admin/Projects.jsx`
  - Hide the table on `md` and below.
  - Implement a mobile card layout showing Project Name, Client, Status, Timeline, and Actions.
- **[MODIFY]** `src/pages/employee/MyTasks.jsx` & `src/pages/admin/Tasks.jsx`
  - Refine the existing mobile card designs to ensure they align perfectly with the updated typography and spacing from our desktop UI updates.
### 3. Responsive Page Headers and Modals
- **[MODIFY]** All major Pages (`Calls.jsx`, `Tasks.jsx`, `Projects.jsx`, etc.)
  - Ensure the top header (Title + Create Button + Filters) stacks nicely using `flex-col sm:flex-row`.
  - Ensure modals (`Modal` component children) use `grid-cols-1 md:grid-cols-2` so input forms are full width on mobile but side-by-side on desktop.
## Verification Plan
### Manual Verification
- Resize the browser window to mobile width (<768px) on all updated pages and verify that the desktop table disappears and the mobile card layout appears.
- Ensure no horizontal scrolling is required to view the data.
- Confirm that actions (Edit, View, Delete) function perfectly from within the mobile cards.