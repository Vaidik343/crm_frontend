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
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6">
        <h3 className="text-lg font-black text-slate-800 mb-6">Filters</h3>

        <div className="space-y-5">
          {/* Employee */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Employee
            </label>
            <select
              value={employee}
              onChange={(e) => onEmployeeChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold"
            >
              <option value="">All Employees</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold"
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
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold"
            >
              {months?.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-800">
            Leave Calculation
          </h3>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Employee
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Entitled
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Used
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Remaining
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    Loading...
                  </td>
                </tr>
              ) : !calculationData || calculationData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-slate-400"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                calculationData.map((emp) => (
                  <tr
                    key={emp.employee_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="font-black text-slate-700">
                        {emp.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {emp.employee_id}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold">
                      {emp.entitled_paid}
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-[#132ea7]">
                      {emp.used_paid}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg font-black text-xs ${
                          emp.remaining_paid > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {emp.remaining_paid}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalculation;