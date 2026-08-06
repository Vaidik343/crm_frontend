const LeaveCalculation = ({
  users = [],
  months = [],
  years = [],
  calculationData = [],
  loading = false,
  employee,
  selectedYears = [],
  month,
  onEmployeeChange,
  onAddYear,
  onRemoveYear,
  onMonthChange,
}) => {
  return (
    <div className="space-y-4">
      {/* ── Filters Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 p-4 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-800 tracking-tight">
            Leave Calculation Filters
          </h3>
        </div>

        {/* 3-column filter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
          {/* Employee */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 truncate">
              Employee
            </label>
            <select
              value={employee}
              onChange={(e) => onEmployeeChange(e.target.value)}
              className="w-full bg-white text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all truncate cursor-pointer"
            >
              <option value="">All</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Add Year */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 truncate">
              Select Year
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) onAddYear(e.target.value);
              }}
              className="w-full bg-white text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all truncate cursor-pointer"
            >
              <option value="">+ Add Year Table</option>
              {years?.filter((y) => y.value).map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label} {selectedYears.includes(String(y.value)) ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 truncate">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full bg-white text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all truncate cursor-pointer"
            >
              {months?.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Year Tags */}
        {selectedYears.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Tables:</span>
            {selectedYears.map((yr) => (
              <span
                key={yr}
                className="inline-flex items-center gap-1 bg-[#132ea7]/10 text-[#132ea7] font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#132ea7]/20"
              >
                {yr}
                {selectedYears.length > 1 && (
                  <button
                    onClick={() => onRemoveYear(yr)}
                    className="hover:text-red-500 font-bold ml-0.5"
                    title={`Remove ${yr} table`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Table Cards (One per selected year) ── */}
      {loading && calculationData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-xs font-bold text-slate-400 animate-pulse uppercase tracking-wider">
          Loading Calculations...
        </div>
      ) : calculationData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-xs font-bold text-slate-400 italic">
          No year tables selected.
        </div>
      ) : (
        calculationData.map((yearData) => {
          const { year: yr, employees = [] } = yearData;
          return (
            <div
              key={yr}
              className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 p-4 space-y-3"
            >
              {/* Card Header for Year */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#132ea7]" />
                  <h4 className="text-sm font-black text-slate-800 tracking-tight">
                    {yr} Leave Calculation
                  </h4>
                  {month && (
                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {months.find((m) => m.value === String(month))?.label || `Month ${month}`}
                    </span>
                  )}
                </div>

                {selectedYears.length > 1 && (
                  <button
                    onClick={() => onRemoveYear(yr)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-bold"
                    title={`Remove ${yr} table`}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100/80">
                      <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Employee
                      </th>
                      <th className="px-1.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Entitled
                      </th>
                      <th className="px-1.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Paid
                      </th>
                      <th className="px-1.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Unpaid
                      </th>
                      <th className="px-1.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Exchange
                      </th>
                    <th className="px-1.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
  {month ? "Total" : "Total Used"}
</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-xs font-bold text-slate-400 animate-pulse uppercase tracking-wider">
                          Loading...
                        </td>
                      </tr>
                    ) : employees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-xs font-bold text-slate-400 italic"
                        >
                          No records found for {yr}.
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp) => (
                        <tr
                          key={emp.employee_id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-slate-800 text-xs leading-tight">
                              {emp.name}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 uppercase font-mono">
                              {emp.employee_id}
                            </div>
                          </td>
                          <td className="px-1.5 py-2.5 text-center text-xs font-bold text-slate-700">
                            {emp.entitled_paid ?? 0}
                          </td>
                          <td className="px-1.5 py-2.5 text-center text-xs font-bold text-[#132ea7]">
                            {emp.used_paid ?? 0}
                          </td>
                          <td className="px-1.5 py-2.5 text-center text-xs font-bold text-amber-600">
                            {emp.used_unpaid ?? 0}
                          </td>
                          <td className="px-1.5 py-2.5 text-center text-xs font-bold text-purple-600">
                            {emp.used_exchange ?? 0}
                          </td>
                      <td className="px-1.5 py-2.5 text-center">
  <span className="px-1.5 py-0.5 rounded-md font-bold text-[11px] inline-block min-w-[20px] bg-slate-100 text-slate-700">
    {month
      ? (emp.total_leave ?? 0)
      : ((Number(emp.used_paid) || 0) + (Number(emp.used_unpaid) || 0))}
  </span>
</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default LeaveCalculation;