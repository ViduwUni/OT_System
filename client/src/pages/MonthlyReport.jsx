import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import TopBar from "../components/TopBar";
import { toast } from "react-toastify";

import { MdCalendarMonth } from "react-icons/md";

function MonthlyReport() {
  const [report, setReport] = useState([]);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://${
          import.meta.env.VITE_APP_BACKEND_IP
        }:5000/api/overtime/monthly-report`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );
      setReport(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch report");
      setReport([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const toggleExpand = (employeeNo) => {
    setExpandedEmployee(expandedEmployee === employeeNo ? null : employeeNo);
  };

  // Excel export logic
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const wsData = [];

      // Summary calculations
      let totalNormal = 0,
        totalDouble = 0,
        totalTriple = 0,
        totalConfirmed = 0,
        totalNight = 0;

      report.forEach((entry) => {
        totalNormal += entry.total_ot_normal_hours ?? 0;
        totalDouble += entry.total_ot_double_hours ?? 0;
        totalTriple += entry.total_ot_triple_hours ?? 0;
        totalConfirmed += entry.total_confirmed_hours ?? 0;
        totalNight += entry.entries?.filter((e) => e.isNightShift).length ?? 0;
      });

      // Summary
      wsData.push([`Overtime Report from ${startDate} to ${endDate}`]);
      wsData.push([]);
      wsData.push(["Summary"]);
      wsData.push(["Total OT Normal Hours", totalNormal.toFixed(2)]);
      wsData.push(["Total OT Double Hours", totalDouble.toFixed(2)]);
      wsData.push(["Total OT Triple Hours", totalTriple.toFixed(2)]);
      wsData.push(["Total Confirmed Hours", totalConfirmed.toFixed(2)]);
      wsData.push(["Total Night Shifts", totalNight]);
      wsData.push([]);
      wsData.push([]);

      // Details per employee
      report.forEach((entry) => {
        wsData.push(
          [`Employee No: ${entry.employee_no}`, `Name: ${entry.employee_name}`],
          [
            "Date",
            "OT Normal",
            "OT Double",
            "OT Triple",
            "Night Shift",
            "Reason",
          ]
        );

        entry.entries?.forEach((day) => {
          wsData.push([
            new Date(day.date).toISOString().slice(0, 10),
            (day.ot_normal_hours ?? 0).toFixed(2),
            (day.ot_double_hours ?? 0).toFixed(2),
            (day.ot_triple_hours ?? 0).toFixed(2),
            day.isNightShift ? "Yes" : "No",
            day.reason || "",
          ]);
        });

        wsData.push([], []);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Dynamic column width
      const getMaxWidths = (data) => {
        const colCount = Math.max(...data.map((row) => row.length));
        const widths = new Array(colCount).fill(0);

        data.forEach((row) => {
          row.forEach((cell, i) => {
            const len = String(cell).length;
            widths[i] = Math.max(widths[i], len);
          });
        });

        return widths.map((w) => ({ wch: w + 5 }));
      };

      ws["!cols"] = getMaxWidths(wsData);
      ws["!freeze"] = { xSplit: 0, ySplit: 10 };

      XLSX.utils.book_append_sheet(wb, ws, "Monthly OT Report");
      XLSX.writeFile(wb, `OT_Report_${startDate}_to_${endDate}.xlsx`);

      toast.success("Excel exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel file.");
    }
  };

  return (
    <div className="bg-white rounded-lg pb-4 shadow overflow-y-hidden">
      <TopBar />

      <div className="px-4 grid gap-3 grid-cols-12">
        <div className="col-span-12 p-4 rounded border border-stone-300">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-medium">
              <MdCalendarMonth /> Monthly OT Report
            </h3>
          </div>

          <div className="max-h-[9rem] overflow-y-auto rounded border border-stone-200 p-2">
            <div className="flex flex-wrap gap-2 items-center">
              <label className="flex items-center gap-2">
                Start Date:
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="border p-1 rounded"
                />
              </label>
              <label className="flex items-center gap-2">
                End Date:
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="border p-1 rounded"
                />
              </label>
              <button
                onClick={exportToExcel}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 p-4 rounded border border-stone-300">
          <div className="mb-4 flex items-center justify-between">
            {/* You can add extra controls or filters here */}
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-sm text-gray-600">Loading...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : report.length === 0 ? (
              <p className="text-sm text-gray-600">
                No data found for selected date range.
              </p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Employee No</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">OT Normal (hrs)</th>
                    <th className="p-2 border">OT Double (hrs)</th>
                    <th className="p-2 border">OT Triple (hrs)</th>
                    <th className="p-2 border">Confirmed Hours</th>
                    <th className="p-2 border">Night Shifts</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((entry, index) => {
                    const normal = entry.total_ot_normal_hours ?? 0;
                    const double = entry.total_ot_double_hours ?? 0;
                    const triple = entry.total_ot_triple_hours ?? 0;
                    const confirmed = entry.total_confirmed_hours ?? 0;
                    const nightShiftCount =
                      entry.entries?.filter((e) => e.isNightShift).length ?? 0;
                    const key = `${entry.employee_no}-${entry.year}-${entry.month}-${index}`;

                    return (
                      <React.Fragment key={key}>
                        <tr
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleExpand(entry.employee_no)}
                        >
                          <td className="p-2 border">{entry.employee_no}</td>
                          <td className="p-2 border">{entry.employee_name}</td>
                          <td className="p-2 border">{normal.toFixed(2)}</td>
                          <td className="p-2 border">{double.toFixed(2)}</td>
                          <td className="p-2 border">{triple.toFixed(2)}</td>
                          <td className="p-2 border">{confirmed.toFixed(2)}</td>
                          <td className="p-2 border">{nightShiftCount}</td>
                        </tr>
                        {expandedEmployee === entry.employee_no &&
                          entry.entries?.length > 0 && (
                            <tr>
                              <td colSpan="7" className="p-2 border bg-gray-50">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-gray-200">
                                      <th className="p-1 border">
                                        Employee No
                                      </th>
                                      <th className="p-1 border">Name</th>
                                      <th className="p-1 border">Date</th>
                                      <th className="p-1 border">
                                        OT Normal (hrs)
                                      </th>
                                      <th className="p-1 border">
                                        OT Double (hrs)
                                      </th>
                                      <th className="p-1 border">
                                        OT Triple (hrs)
                                      </th>
                                      <th className="p-1 border">
                                        Night Shift
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {entry.entries.map((day, i) => (
                                      <tr key={i}>
                                        <td className="p-1 border">
                                          {entry.employee_no}
                                        </td>
                                        <td className="p-1 border">
                                          {entry.employee_name}
                                        </td>
                                        <td className="p-1 border">
                                          {new Date(
                                            day.date
                                          ).toLocaleDateString()}
                                        </td>
                                        <td className="p-1 border">
                                          {(day.ot_normal_hours ?? 0).toFixed(
                                            2
                                          )}
                                        </td>
                                        <td className="p-1 border">
                                          {(day.ot_double_hours ?? 0).toFixed(
                                            2
                                          )}
                                        </td>
                                        <td className="p-1 border">
                                          {(day.ot_triple_hours ?? 0).toFixed(
                                            2
                                          )}
                                        </td>
                                        <td className="p-1 border">
                                          {day.isNightShift ? "Yes" : "No"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyReport;
