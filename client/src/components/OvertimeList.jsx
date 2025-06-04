import React, { useEffect, useState } from "react";
import axios from "axios";

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
            alert("Bulk approval failed.");
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
                } else if (filterPeriod === "monthly") {
                    return (
                        entryDate.getFullYear() === filterDt.getFullYear() &&
                        entryDate.getMonth() === filterDt.getMonth()
                    );
                } else if (filterPeriod === "yearly") {
                    return entryDate.getFullYear() === filterDt.getFullYear();
                }
                return true;
            });
        }

        setFilteredEntries(filtered);
    }, [entries, filterEmployee, filterPeriod, filterDate]);

    const getDateInputType = () => {
        if (filterPeriod === "daily") return "date";
        if (filterPeriod === "monthly") return "month";
        if (filterPeriod === "yearly") return "number";
        return "date";
    };

    const handleYearChange = (e) => {
        let val = e.target.value;
        if (/^\d{0,4}$/.test(val)) {
            setFilterDate(val);
        }
    };

    const parseFilterDate = () => {
        if (filterPeriod === "yearly") {
            const yearNum = parseInt(filterDate);
            if (yearNum && yearNum > 1900 && yearNum < 2100) {
                return new Date(yearNum, 0, 1);
            }
            return null;
        }
        return filterDate;
    };

    useEffect(() => {
        if (filterPeriod === "yearly") {
            const parsedDate = parseFilterDate();
            if (parsedDate) setFilterDate(parsedDate.toISOString().slice(0, 10));
            else setFilteredEntries([]);
        }
    }, [filterDate, filterPeriod]);

    const totalOTs = filteredEntries.reduce(
        (sum, e) => sum + Number(e.confirmed_hours || 0),
        0
    );

    return (
        <>
            <h2>Overtime Entries</h2>

            <div>
                <label>
                    Employee:&nbsp;
                    <select
                        value={filterEmployee}
                        onChange={(e) => setFilterEmployee(e.target.value)}
                    >
                        <option value="">All Employees</option>
                        {employees.map((emp) => (
                            <option key={emp._id} value={emp.employee_no}>
                                {emp.employee_no} - {emp.employee_name}
                            </option>
                        ))}
                    </select>
                </label>

                &nbsp;&nbsp;

                <label>
                    Period:&nbsp;
                    <select
                        value={filterPeriod}
                        onChange={(e) => {
                            setFilterPeriod(e.target.value);
                            const now = new Date();
                            if (e.target.value === "daily") {
                                setFilterDate(now.toISOString().slice(0, 10));
                            } else if (e.target.value === "monthly") {
                                setFilterDate(now.toISOString().slice(0, 7));
                            } else if (e.target.value === "yearly") {
                                setFilterDate(now.getFullYear().toString());
                            }
                        }}
                    >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </label>

                &nbsp;&nbsp;

                <label>
                    Date:&nbsp;
                    {filterPeriod === "yearly" ? (
                        <input
                            type="text"
                            maxLength="4"
                            value={filterDate}
                            onChange={handleYearChange}
                            placeholder="YYYY"
                        />
                    ) : (
                        <input
                            type={getDateInputType()}
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    )}
                </label>
            </div>

            <div>
                Total Confirmed Overtime Hours: {totalOTs}
            </div>

            {filteredEntries.length > 0 && (
                <div>
                    <label>
                        Set Approval Stage:&nbsp;
                        <select
                            value={bulkApprovalStage}
                            onChange={(e) => setBulkApprovalStage(e.target.value)}
                        >
                            <option value="approved(production)">Approved (Production)</option>
                            <option value="final_approved(hr)">Final Approved (HR)</option>
                        </select>
                    </label>
                    &nbsp;&nbsp;
                    <button onClick={handleBulkApprove}>Bulk Approve</button>
                </div>
            )}

            {loading ? (
                <p>Loading entries...</p>
            ) : error ? (
                <p>{error}</p>
            ) : filteredEntries.length === 0 ? (
                <p>No overtime entries found.</p>
            ) : (
                <>
                    <table border="1" cellPadding="10" cellSpacing="0" width="100%">
                        <thead>
                            <tr>
                                <th>Employee No</th>
                                <th>Name</th>
                                <th>Date</th>
                                <th>In Time</th>
                                <th>Out Time</th>
                                <th>Ot_normal_hours</th>
                                <th>Ot_double_hours</th>
                                <th>Ot_triple_hours</th>
                                <th>Total Ot Hours</th>
                                <th>Night Shift</th>
                                <th>Confirmed Hours</th>
                                <th>Reason</th>
                                <th>Approval Stage</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.map((e) =>
                                editId === e._id ? (
                                    <tr key={e._id}>
                                        <td>
                                            <select
                                                name="employee_no"
                                                value={editForm.employee_no}
                                                onChange={handleEditChange}
                                            >
                                                <option value="">Select Employee</option>
                                                {employees.map((emp) => (
                                                    <option key={emp._id} value={emp.employee_no}>
                                                        {emp.employee_no} - {emp.employee_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                name="employee_name"
                                                value={editForm.employee_name}
                                                readOnly
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="date"
                                                name="date"
                                                value={editForm.date}
                                                onChange={handleEditChange}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="datetime-local"
                                                name="inTime"
                                                value={editForm.inTime}
                                                onChange={handleEditChange}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="datetime-local"
                                                name="outTime"
                                                value={editForm.outTime}
                                                onChange={handleEditChange}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                name="ot_normal_hours"
                                                value={editForm.ot_normal_hours}
                                                onChange={handleEditChange}
                                                disabled
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                name="ot_double_hours"
                                                value={editForm.ot_double_hours}
                                                onChange={handleEditChange}
                                                disabled
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                name="ot_triple_hours"
                                                value={editForm.ot_triple_hours}
                                                onChange={handleEditChange}
                                                disabled
                                            />
                                        </td>
                                        <td>
                                            {Number(editForm.ot_normal_hours || 0) +
                                                Number(editForm.ot_double_hours || 0) +
                                                Number(editForm.ot_triple_hours || 0)}
                                        </td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                name="isNightShift"
                                                checked={editForm.isNightShift}
                                                onChange={handleEditChange}
                                                disabled
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                name="confirmed_hours"
                                                value={editForm.confirmed_hours}
                                                onChange={handleEditChange}
                                                min="0"
                                                step="0.1"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                name="reason"
                                                value={editForm.reason}
                                                onChange={handleEditChange}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                name="approval_stage"
                                                value={editForm.approval_stage}
                                                onChange={handleEditChange}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved(production)">Approved (Production)</option>
                                                <option value="final_approved(hr)">Final Approved (HR)</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button onClick={saveEdit}>Save</button>
                                            <button onClick={cancelEdit}>
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={e._id}>
                                        <td>{e.employee_no}</td>
                                        <td>{e.employee_name}</td>
                                        <td>{new Date(e.date).toLocaleDateString()}</td>
                                        <td>{new Date(e.inTime).toLocaleString()}</td>
                                        <td>{new Date(e.outTime).toLocaleString()}</td>
                                        <td>{e.ot_normal_hours}</td>
                                        <td>{e.ot_double_hours}</td>
                                        <td>{e.ot_triple_hours}</td>
                                        <td>{e.ot_normal_hours + e.ot_double_hours + e.ot_triple_hours}</td>
                                        <td>{e.isNightShift ? "Yes" : "No"}</td>
                                        <td>{e.confirmed_hours}</td>
                                        <td>{e.reason}</td>
                                        <td>{e.approval_stage}</td>
                                        <td>
                                            <button onClick={() => startEdit(e)}>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(e._id)}>Delete</button>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </>
            )}
        </>
    );
}

export default OvertimeList;