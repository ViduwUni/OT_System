import { useEffect, useState, useContext } from "react";
import axios from "axios";
import TopBar from '../components/TopBar'
import { AuthContext } from "../context/AuthContext";

import { IoTime } from "react-icons/io5";

const API_BASE = `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/overtime`;
const EMPLOYEE_API = `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/employee`;

function OvertimeList() {
    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [employees, setEmployees] = useState([]);
    const { user } = useContext(AuthContext);

    const [filterEmployee, setFilterEmployee] = useState("");
    const [filterPeriod, setFilterPeriod] = useState("daily");
    const [filterDate, setFilterDate] = useState(() => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    });
    const [bulkApprovalStage, setBulkApprovalStage] = useState("approved(production)");

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_BASE);
            setEntries(res.data);
            setError(null);
        } catch {
            setError("Failed to load entries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        axios.get(EMPLOYEE_API).then((res) => setEmployees(res.data)).catch(() => { });
    }, []);

    useEffect(() => {
        fetchEntries();
    }, []);

    function toLocalDatetime(isoString) {
        if (!isoString) return "";
        const dt = new Date(isoString);
        const pad = (n) => (n < 10 ? "0" + n : n);
        return (
            dt.getFullYear() +
            "-" +
            pad(dt.getMonth() + 1) +
            "-" +
            pad(dt.getDate()) +
            "T" +
            pad(dt.getHours()) +
            ":" +
            pad(dt.getMinutes())
        );
    }

    const startEdit = (entry) => {
        setEditId(entry._id);
        setEditForm({
            employee_no: entry.employee_no,
            employee_name: entry.employee_name,
            date: entry.date ? entry.date.slice(0, 10) : "",
            inTime: toLocalDatetime(entry.inTime),
            outTime: toLocalDatetime(entry.outTime),
            isNightShift: entry.isNightShift,
            reason: entry.reason || "",
            confirmed_hours: entry.confirmed_hours || 0,
            approval_stage: entry.approval_stage || "pending",
            ot_normal_hours: entry.ot_normal_hours || 0,
            ot_double_hours: entry.ot_double_hours || 0,
            ot_triple_hours: entry.ot_triple_hours || 0,
        });
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditForm({});
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === "checkbox" ? checked : value;

        let updatedForm = { ...editForm, [name]: val };

        if (name === "employee_no") {
            const emp = employees.find((emp) => emp.employee_no === val);
            updatedForm.employee_name = emp ? emp.employee_name : "";
        }

        setEditForm(updatedForm);
    };

    function localDatetimeToISO(localDatetimeStr) {
        if (!localDatetimeStr) return null;
        const [datePart, timePart] = localDatetimeStr.split("T");
        if (!datePart || !timePart) return null;

        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);

        const dt = new Date(year, month - 1, day, hour, minute);
        return dt.toISOString();
    }

    const saveEdit = async () => {
        if (
            !editForm.employee_no ||
            !editForm.employee_name ||
            !editForm.date ||
            !editForm.inTime ||
            !editForm.outTime
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const payload = {
                employee_no: editForm.employee_no,
                employee_name: editForm.employee_name,
                date: new Date(editForm.date).toISOString(),
                inTime: localDatetimeToISO(editForm.inTime),
                outTime: localDatetimeToISO(editForm.outTime),
                isNightShift: editForm.isNightShift,
                reason: editForm.reason,
                confirmed_hours: Number(editForm.confirmed_hours),
                approval_stage: editForm.approval_stage,
                ot_normal_hours: Number(editForm.ot_normal_hours),
                ot_double_hours: Number(editForm.ot_double_hours),
                ot_triple_hours: Number(editForm.ot_triple_hours),
            };

            await axios.put(`${API_BASE}/${editId}`, payload);

            setEntries((prev) =>
                prev.map((e) => (e._id === editId ? { ...e, ...payload } : e))
            );
            cancelEdit();
        } catch {
            alert("Failed to save changes.");
        }
    };

    const handleBulkApprove = async () => {
        if (
            !window.confirm(
                `Are you sure you want to set approval stage to "${bulkApprovalStage}" for all filtered entries?`
            )
        )
            return;

        try {
            const updates = filteredEntries.map((entry) =>
                axios.put(`${API_BASE}/${entry._id}`, {
                    ...entry,
                    approval_stage: bulkApprovalStage,
                })
            );

            await Promise.all(updates);

            setEntries((prev) =>
                prev.map((e) =>
                    filteredEntries.some((fe) => fe._id === e._id)
                        ? { ...e, approval_stage: bulkApprovalStage }
                        : e
                )
            );
            alert("Bulk approval successful.");
        } catch (err) {
            alert("Bulk approval failed.", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this entry?")) return;
        try {
            await axios.delete(`${API_BASE}/${id}`);
            setEntries(entries.filter((e) => e._id !== id));
        } catch {
            alert("Failed to delete entry");
        }
    };

    useEffect(() => {
        let filtered = [...entries];

        if (filterEmployee) {
            filtered = filtered.filter((e) => e.employee_no === filterEmployee);
        }

        if (filterDate) {
            const filterDt = new Date(filterDate);

            filtered = filtered.filter((e) => {
                const entryDate = new Date(e.date);

                if (filterPeriod === "daily") {
                    return (
                        entryDate.getFullYear() === filterDt.getFullYear() &&
                        entryDate.getMonth() === filterDt.getMonth() &&
                        entryDate.getDate() === filterDt.getDate()
                    );
                }

                // monthly
                return (
                    entryDate.getFullYear() === filterDt.getFullYear() &&
                    entryDate.getMonth() === filterDt.getMonth()
                );
            });
        }

        setFilteredEntries(filtered);
    }, [entries, filterEmployee, filterPeriod, filterDate]);

    const getDateInputType = () => {
        if (filterPeriod === "daily") return "date";
        if (filterPeriod === "monthly") return "month";
        return "date";
    };

    const totalOTs = filteredEntries.reduce(
        (sum, e) => sum + Number(e.confirmed_hours || 0),
        0
    );

    return (
        <div className="bg-white rounded-lg pb-4 shadow overflow-y-hidden">
            {/* Top bar (if you have one) */}
            <TopBar />

            <div className="px-4 grid gap-3 grid-cols-12">
                {/* Filter & controls section */}
                <div className="col-span-12 p-4 rounded border border-stone-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 font-medium">
                            <IoTime /> Overtime Entries
                        </h3>
                    </div>

                    <div className="max-h-[10rem] overflow-y-auto rounded border border-stone-200 p-2 space-y-3">
                        {/* Filters */}
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Employee Filter */}
                            <label className="flex items-center">
                                <span className="mr-2 font-medium">Employee:</span>
                                <select
                                    value={filterEmployee}
                                    onChange={(e) => setFilterEmployee(e.target.value)}
                                    className="border p-1 rounded"
                                >
                                    <option value="">All Employees</option>
                                    {employees.map((emp) => (
                                        <option key={emp._id} value={emp.employee_no}>
                                            {emp.employee_no} - {emp.employee_name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {/* Period Filter */}
                            <label className="flex items-center">
                                <span className="mr-2 font-medium">Period:</span>
                                <select
                                    value={filterPeriod}
                                    onChange={(e) => {
                                        setFilterPeriod(e.target.value);
                                        const now = new Date();
                                        if (e.target.value === "daily") {
                                            setFilterDate(now.toISOString().slice(0, 10));
                                        } else if (e.target.value === "monthly") {
                                            setFilterDate(now.toISOString().slice(0, 7));
                                        }
                                    }}
                                    className="border p-1 rounded"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </label>

                            {/* Date Filter */}
                            <label className="flex items-center">
                                <span className="mr-2 font-medium">Date:</span>
                                <input
                                    type={getDateInputType()}
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="border p-1 rounded"
                                />
                            </label>
                        </div>

                        {/* Summary & Bulk Approve */}
                        <div className="flex flex-wrap gap-4 flex-col items-start">
                            <div className="font-medium">
                                Total Confirmed Overtime Hours:{" "}
                                <span className="text-indigo-600">{totalOTs}</span>
                            </div>

                            {filteredEntries.length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center">
                                    <label className="flex items-center">
                                        <span className="mr-2 font-medium">Set Approval Stage:</span>
                                        <select
                                            value={bulkApprovalStage}
                                            onChange={(e) => setBulkApprovalStage(e.target.value)}
                                            className="border p-1 rounded"
                                        >
                                            <option value="approved(production)">
                                                Approved (Production)
                                            </option>
                                            <option value="final_approved(hr)">
                                                Final Approved (HR)
                                            </option>
                                        </select>
                                    </label>
                                    {user?.role === 'supervisor(production)' ? (<button
                                        onClick={handleBulkApprove}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        Bulk Approve
                                    </button>) : ''}
                                </div>
                            )}
                        </div>

                        {/* Loading / Error / No Data Messages */}
                        {loading ? (
                            <p className="text-gray-600">Loading entries...</p>
                        ) : error ? (
                            <p className="text-red-600">{error}</p>
                        ) : filteredEntries.length === 0 ? (
                            <p className="text-gray-600">No overtime entries found.</p>
                        ) : null}
                    </div>
                </div>

                {/* Table section */}
                <div className="col-span-12 p-4 rounded border border-stone-300">
                    <div className="border border-gray-300 rounded overflow-hidden h-full flex flex-col">
                        <div className="overflow-y-auto flex-grow">
                            <table className="min-w-full h-fit text-sm border-collapse">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-2 border">Employee No</th>
                                        <th className="p-2 border">Name</th>
                                        <th className="p-2 border">Date</th>
                                        <th className="p-2 border">In Time</th>
                                        <th className="p-2 border">Out Time</th>
                                        <th className="p-2 border">Ot Normal</th>
                                        <th className="p-2 border">Ot Double</th>
                                        <th className="p-2 border">Ot Triple</th>
                                        <th className="p-2 border">Total OT</th>
                                        <th className="p-2 border">Night Shift</th>
                                        <th className="p-2 border">Confirmed</th>
                                        <th className="p-2 border">Reason</th>
                                        <th className="p-2 border">Approval Stage</th>
                                        <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEntries.map((e) =>
                                        editId === e._id ? (
                                            <tr key={e._id} className="bg-white">
                                                <td className="p-2 border">
                                                    <select
                                                        name="employee_no"
                                                        value={editForm.employee_no}
                                                        onChange={handleEditChange}
                                                        className="border p-1 rounded w-full"
                                                        disabled={user?.role === 'supervisor(production)'}
                                                    >
                                                        <option value="">Select Employee</option>
                                                        {employees.map((emp) => (
                                                            <option key={emp._id} value={emp.employee_no}>
                                                                {emp.employee_no} - {emp.employee_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="text"
                                                        name="employee_name"
                                                        value={editForm.employee_name}
                                                        disabled
                                                        className="border p-1 rounded w-full bg-gray-100"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        value={editForm.date}
                                                        onChange={handleEditChange}
                                                        className="border p-1 rounded"
                                                        disabled={user?.role === 'supervisor(production)'}
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="datetime-local"
                                                        name="inTime"
                                                        value={editForm.inTime}
                                                        onChange={handleEditChange}
                                                        className="border p-1 rounded"
                                                        disabled={user?.role === 'supervisor(production)'}
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="datetime-local"
                                                        name="outTime"
                                                        value={editForm.outTime}
                                                        onChange={handleEditChange}
                                                        className="border p-1 rounded"
                                                        disabled={user?.role === 'supervisor(production)'}
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        name="ot_normal_hours"
                                                        value={editForm.ot_normal_hours}
                                                        onChange={handleEditChange}
                                                        disabled
                                                        className="border p-1 rounded bg-gray-100 w-full"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        name="ot_double_hours"
                                                        value={editForm.ot_double_hours}
                                                        onChange={handleEditChange}
                                                        disabled
                                                        className="border p-1 rounded bg-gray-100 w-full"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        name="ot_triple_hours"
                                                        value={editForm.ot_triple_hours}
                                                        onChange={handleEditChange}
                                                        disabled
                                                        className="border p-1 rounded bg-gray-100 w-full"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <span className="block">
                                                        {Number(editForm.ot_normal_hours || 0) +
                                                            Number(editForm.ot_double_hours || 0) +
                                                            Number(editForm.ot_triple_hours || 0)}
                                                    </span>
                                                </td>
                                                <td className="p-2 border text-center">
                                                    <input
                                                        type="checkbox"
                                                        name="isNightShift"
                                                        checked={editForm.isNightShift}
                                                        onChange={handleEditChange}
                                                        disabled
                                                        className="transform scale-125"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="number"
                                                        name="confirmed_hours"
                                                        value={editForm.confirmed_hours}
                                                        onChange={handleEditChange}
                                                        min="0"
                                                        step="0.1"
                                                        className="border p-1 rounded w-full"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <input
                                                        type="text"
                                                        name="reason"
                                                        value={editForm.reason}
                                                        onChange={handleEditChange}
                                                        className="border p-1 rounded w-full"
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <select
                                                        name="approval_stage"
                                                        value={editForm.approval_stage}
                                                        onChange={handleEditChange}
                                                        className="border p-1 rounded w-full"
                                                        disabled={user?.role === 'supervisor(production)'}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="approved(production)">
                                                            Approved (Production)
                                                        </option>
                                                        <option value="final_approved(hr)">
                                                            Final Approved (HR)
                                                        </option>
                                                    </select>
                                                </td>
                                                <td className="p-2 border whitespace-nowrap space-x-2">
                                                    <button
                                                        onClick={saveEdit}
                                                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={e._id} className="bg-white">
                                                <td className="p-2 border">{e.employee_no}</td>
                                                <td className="p-2 border">{e.employee_name}</td>
                                                <td className="p-2 border">
                                                    {new Date(e.date).toLocaleDateString()}
                                                </td>
                                                <td className="p-2 border">
                                                    {new Date(e.inTime).toLocaleString()}
                                                </td>
                                                <td className="p-2 border">
                                                    {new Date(e.outTime).toLocaleString()}
                                                </td>
                                                <td className="p-2 border">{e.ot_normal_hours}</td>
                                                <td className="p-2 border">{e.ot_double_hours}</td>
                                                <td className="p-2 border">{e.ot_triple_hours}</td>
                                                <td className="p-2 border">
                                                    {e.ot_normal_hours + e.ot_double_hours + e.ot_triple_hours}
                                                </td>
                                                <td className="p-2 border text-center">
                                                    {e.isNightShift ? "Yes" : "No"}
                                                </td>
                                                <td className="p-2 border">{e.confirmed_hours}</td>
                                                <td className="p-2 border">{e.reason}</td>
                                                <td className="p-2 border">{e.approval_stage}</td>
                                                <td className="p-2 border whitespace-nowrap space-x-2">
                                                    <button
                                                        onClick={() => startEdit(e)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(e._id)}
                                                        className="text-red-600 hover:underline"
                                                        disabled={user?.role === 'supervisor(production)'}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OvertimeList;