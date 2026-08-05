const LeaveCalculation = ({
  users = [],
  months = [],
  years = [],
  calculationData = [],
  loading = false,
  employee,
  year,
  month,
  onEmployeeChange,
  onYearChange,
  onMonthChange,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <h3 className="text-base font-black text-slate-800 tracking-tight">
          Leave Calculation
        </h3>
      </div>

      {/* Filters (Compact 3-column grid) */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
        {/* Employee */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 truncate">
            Employee
          </label>
          <select
            value={employee}
            onChange={(e) => onEmployeeChange(e.target.value)}
            className="w-full bg-white text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all truncate"
          >
            <option value="">All</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.employee_id})
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 truncate">
            Year
          </label>
          <select
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full bg-white text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all truncate"
          >
            {years?.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
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
            className="w-full bg-white text-xs font-bold text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#132ea7]/20 focus:border-[#132ea7] transition-all truncate"
          >
            {months?.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
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
                {month ? "Total" : "Remaining"}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs font-bold text-slate-400 animate-pulse uppercase tracking-wider">
                  Loading...
                </td>
              </tr>
            ) : !calculationData || calculationData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-xs font-bold text-slate-400 italic"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              calculationData.map((emp) => (
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
                    {emp.remaining_paid !== undefined && !month ? (
                      <span
                        className={`px-1.5 py-0.5 rounded-md font-bold text-[11px] inline-block min-w-[20px] ${
                          emp.remaining_paid > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {emp.remaining_paid}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md font-bold text-[11px] inline-block min-w-[20px] bg-slate-100 text-slate-700">
                        {emp.total_leave ?? 0}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveCalculation;