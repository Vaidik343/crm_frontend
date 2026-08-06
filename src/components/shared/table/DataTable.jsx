import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const DataTable = ({
  columns = [],
  rows = [],
  rowKey = "id",
  emptyMessage = "No data found.",
  className = "",
}) => {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <TableContainer
        component={Paper}
        elevation={0}
        className={`rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 ${className}`}
      >
        <Table
          sx={{
            minWidth: 1500,
            tableLayout: "fixed",
            fontFamily: "inherit",
            border: 0,
            "& .MuiTableCell-root": {
              fontFamily: "inherit",
            },
          }}
        >
          {/* Header */}
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#f8fafc",
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || "left"}
                  sx={{
                    width: column.width,
                    minWidth: column.width,
                    px: "20px",
                    py: 2.5,
                    borderBottom: "1px solid #e2e8f0",
                    fontWeight: 800,
                    fontSize: 12,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: ".12em",
                    whiteSpace: "nowrap",
                    backgroundColor: "transparent",
                    fontFamily: "inherit",
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{
                    py: 8,
                    color: "#64748b",
                    fontWeight: 700,
                    fontFamily: "inherit",
                  }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row[rowKey]}
                  hover
                  sx={{
                    height: "72px",
                    cursor: "default",
                    transition: "background .15s ease",
                    "&:hover": {
                      backgroundColor: "#f8fafc !important",
                    },
                    "& td": {
                      borderBottom: "1px solid #f1f5f9",
                      fontFamily: "inherit",
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.field];

                    return (
                      <TableCell
                        key={column.field}
                        align={column.align || "left"}
                        sx={{
                          px: "20px",
                          py: 0,
                          verticalAlign: "middle",
                          fontFamily: "inherit",
                          outline: "none",
                        }}
                      >
                        {column.renderCell
                          ? column.renderCell({
                              row,
                              value,
                              field: column.field,
                            })
                          : typeof value === "object" && value !== null
                          ? "—"
                          : value ?? "—"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DataTable;