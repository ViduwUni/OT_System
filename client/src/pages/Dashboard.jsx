import { useState, useEffect } from "react";
import axios from "axios";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#D65DB1', '#FF6F91'];

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
        const res = await axios.get(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/employee`);
        setEmployees(res.data);
    };

    const fetchOTMonthly = async () => {
        const startDate = "2025-01-01";
        const endDate = "2025-12-31";

        const res = await axios.get(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/overtime/monthly-report`, {
            params: { startDate, endDate },
        });

        const monthly = {};
        res.data.forEach((entry) => {
            const key = `${entry.year}-${String(entry.month).padStart(2, '0')}`;
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
        const res = await axios.get(`http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/overtime`);
        const all = res.data;

        const byEmp = {};
        all.forEach(e => {
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
        <div>

            <h2>📊 Dashboard Overview</h2>

            <div>

                {/* Employee List */}
                <div>
                    <h3>👥 Employees</h3>
                    <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp._id}>
                                    <td>{emp.employee_no}</td>
                                    <td>{emp.employee_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Monthly OT Chart */}
                <div>
                    <h3>📅 Monthly OT Hours</h3>
                    <ResponsiveContainer width="100%" height={300}>
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

                {/* OT by Employee Chart */}
                <div>
                    <h3>🏆 OT Hours by Employee</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={otByEmployee}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {otByEmployee.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}