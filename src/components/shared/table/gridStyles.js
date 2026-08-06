export const gridStyles = {
  border: 0,

  fontFamily: "inherit",

  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },

  "& .MuiDataGrid-columnHeader": {
    padding: "0 20px",
  },

  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    color: "#64748b",
  },

  "& .MuiDataGrid-row": {
    minHeight: "72px !important",
    maxHeight: "72px !important",
    cursor: "default",
    transition: "background .15s ease",
  },

  "& .MuiDataGrid-row:hover": {
    backgroundColor: "#f8fafc",
  },

  "& .MuiDataGrid-cell": {
    padding: "0 20px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    outline: "none",
  },

  "& .MuiDataGrid-cell:focus": {
    outline: "none",
  },

  "& .MuiDataGrid-columnHeader:focus": {
    outline: "none",
  },

  "& .MuiDataGrid-columnSeparator": {
    display: "none",
  },

  "& .MuiDataGrid-footerContainer": {
    borderTop: "1px solid #e2e8f0",
    backgroundColor: "#fff",
  },

  "& .MuiTablePagination-root": {
    color: "#475569",
    fontWeight: 600,
  },

  "& .MuiDataGrid-overlay": {
    backgroundColor: "#fff",
  },

  "& .MuiCircularProgress-root": {
    color: "#132ea7",
  },

  "& .MuiDataGrid-virtualScroller": {
    scrollbarWidth: "thin",
  },
};