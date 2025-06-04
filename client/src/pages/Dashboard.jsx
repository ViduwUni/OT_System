import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import TopBar from "../components/TopBar";
import { MdCalendarMonth } from "react-icons/md";
import { TbClockHour10Filled } from "react-icons/tb";
import { FaHelmetSafety } from "react-icons/fa6";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#845EC2",
  "#D65DB1",
  "#FF6F91",
];

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [otByEmployee, setOtByEmployee] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchOTMonthly();
    fetchAllOT();
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get(
      `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/employee`
    );
    setEmployees(res.data);
  };

  const fetchOTMonthly = async () => {
    const startDate = "2025-01-01";
    const endDate = "2025-12-31";

    const res = await axios.get(
      `http://${
        import.meta.env.VITE_APP_BACKEND_IP
      }:5000/api/overtime/monthly-report`,
      {
        params: { startDate, endDate },
      }
    );

    const monthly = {};
    res.data.forEach((entry) => {
      const key = `${entry.year}-${String(entry.month).padStart(2, "0")}`;
      if (!monthly[key]) monthly[key] = 0;
      monthly[key] += entry.total_confirmed_hours;
    });

    const chartData = Object.entries(monthly).map(([month, totalHours]) => ({
      month,
      totalHours: Number(totalHours.toFixed(2)),
    }));

    setMonthlyData(chartData);
  };

  const fetchAllOT = async () => {
    const res = await axios.get(
      `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/overtime`
    );
    const all = res.data;

    const byEmp = {};
    all.forEach((e) => {
      if (!byEmp[e.employee_name]) byEmp[e.employee_name] = 0;
      byEmp[e.employee_name] += e.confirmed_hours || 0;
    });

    const chartData = Object.entries(byEmp).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    setOtByEmployee(chartData);
  };

  return (
    <div className="bg-white rounded-lg pb-4 shadow h-[95vh]">
      <TopBar />

      <div className="px-4 grid gap-3 grid-cols-12">
        <div className="col-span-8 overflow-hidden rounded border border-stone-300">
          <div className="p-4">
            <h3 className="flex items-center gap-1.5 font-medium">
              <MdCalendarMonth /> Monthly OT Hours
            </h3>
          </div>

          <div className="h-64 px-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalHours" fill="#8884d8" name="Total OT" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-4 overflow-hidden rounded border border-stone-300">
          <div className="p-4">
            <h3 className="flex items-center gap-1.5 font-medium">
              <TbClockHour10Filled /> OT Hours by Employee
            </h3>
          </div>

          <div className="h-64 px-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={otByEmployee}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {otByEmployee.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 p-4 rounded border border-stone-300">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-medium">
              <FaHelmetSafety /> Employees
            </h3>
          </div>
          <div className="max-h-[12rem] overflow-y-auto rounded border border-stone-200">
            <table className="w-full table-auto border border-stone-300 rounded overflow-hidden">
              <thead>
                <tr className="bg-stone-100 text-sm font-medium text-stone-600">
                  <th className="text-left px-4 py-2 border-b border-stone-300">
                    No
                  </th>
                  <th className="text-left px-4 py-2 border-b border-stone-300">
                    Name
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => (
                  <tr
                    key={emp._id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-stone-50"
                    } hover:bg-stone-100`}
                  >
                    <td className="px-4 py-2 border-b border-stone-200">
                      {emp.employee_no}
                    </td>
                    <td className="px-4 py-2 border-b border-stone-200">
                      {emp.employee_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
