import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api/overtime";
const EMPLOYEE_API = "http://localhost:5000/api/employee";

function OvertimeList() {
    const [entries, setEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [employees, setEmployees] = useState([]);

    // Filter states
    const [filterEmployee, setFilterEmployee] = useState("");
    const [filterPeriod, setFilterPeriod] = useState("daily"); // daily, monthly, yearly
    const [filterDate, setFilterDate] = useState(() => {
        // default today date in yyyy-MM-dd format
        const d = new Date();
        return d.toISOString().slice(0, 10);
    });

    // Load overtime entries
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

    // Load employees for dropdown (for employee_no edit and filter)
    useEffect(() => {
        axios
            .get(EMPLOYEE_API)
            .then((res) => setEmployees(res.data))
            .catch(() => { });
    }, []);

    useEffect(() => {
        fetchEntries();
    }, []);

    // Convert ISO datetime string to a local datetime string compatible with input[type=datetime-local]
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

    // Begin editing a row
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
        });
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditId(null);
        setEditForm({});
    };

    // Handle changes in edit inputs
    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === "checkbox" ? checked : value;

        let updatedForm = { ...editForm, [name]: val };

        // If employee_no changes, update employee_name automatically
        if (name === "employee_no") {
            const emp = employees.find((emp) => emp.employee_no === val);
            updatedForm.employee_name = emp ? emp.employee_name : "";
        }

        setEditForm(updatedForm);
    };

    // Convert local datetime string (from input) to ISO string for backend
    function localDatetimeToISO(localDatetimeStr) {
        if (!localDatetimeStr) return null;
        // The localDatetimeStr is like "2025-05-29T14:30"
        // Date constructor treats it as UTC, but we want local time
        // So parse components manually:
        const [datePart, timePart] = localDatetimeStr.split("T");
        if (!datePart || !timePart) return null;

        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);

        // Create a Date object in local timezone
        const dt = new Date(year, month - 1, day, hour, minute);
        return dt.toISOString();
    }

    // Save edited row
    const saveEdit = async () => {
        // Basic validation
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
                date: new Date(editForm.date).toISOString(), // date only in ISO format
                inTime: localDatetimeToISO(editForm.inTime),
                outTime: localDatetimeToISO(editForm.outTime),
                isNightShift: editForm.isNightShift,
                reason: editForm.reason,
            };
            await axios.put(`${API_BASE}/${editId}`, payload);

            // Update local state to reflect changes
            setEntries((prev) =>
                prev.map((e) =>
                    e._id === editId
                        ? {
                            ...e,
                            ...payload,
                            date: editForm.date, // keep string date for display
                            inTime: editForm.inTime,
                            outTime: editForm.outTime,
                        }
                        : e
                )
            );
            cancelEdit();
        } catch {
            alert("Failed to save changes.");
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

    // Filtering logic
    useEffect(() => {
        let filtered = [...entries];

        // Filter by employee if selected
        if (filterEmployee) {
            filtered = filtered.filter((e) => e.employee_no === filterEmployee);
        }

        // Filter by period & date
        if (filterDate) {
            const filterDt = new Date(filterDate);

            filtered = filtered.filter((e) => {
                const entryDate = new Date(e.date);

                if (filterPeriod === "daily") {
                    // Match year, month, day
                    return (
                        entryDate.getFullYear() === filterDt.getFullYear() &&
                        entryDate.getMonth() === filterDt.getMonth() &&
                        entryDate.getDate() === filterDt.getDate()
                    );
                } else if (filterPeriod === "monthly") {
                    // Match year & month
                    return (
                        entryDate.getFullYear() === filterDt.getFullYear() &&
                        entryDate.getMonth() === filterDt.getMonth()
                    );
                } else if (filterPeriod === "yearly") {
                    // Match year only
                    return entryDate.getFullYear() === filterDt.getFullYear();
                }
                return true;
            });
        }

        setFilteredEntries(filtered);
    }, [entries, filterEmployee, filterPeriod, filterDate]);

    // Format date input field depending on filterPeriod
    const getDateInputType = () => {
        if (filterPeriod === "daily") return "date";
        if (filterPeriod === "monthly") return "month";
        if (filterPeriod === "yearly") return "number"; // we'll handle year input specially
        return "date";
    };

    // For yearly filter, use a text input with year only
    const handleYearChange = (e) => {
        let val = e.target.value;
        // Ensure only numbers and max length 4
        if (/^\d{0,4}$/.test(val)) {
            setFilterDate(val);
        }
    };

    // Convert yearly input to Date (Jan 1st of that year) for filtering
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

    // Use parsed date for filtering
    useEffect(() => {
        if (filterPeriod === "yearly") {
            const parsedDate = parseFilterDate();
            if (parsedDate) setFilterDate(parsedDate.toISOString().slice(0, 10));
            else setFilteredEntries([]); // invalid year, empty
        }
    }, [filterDate, filterPeriod]);

    return (
        <>
            <h2>Overtime Entries</h2>

            {/* Filters */}
            <div style={{ marginBottom: 20 }}>
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
                            // Reset filterDate accordingly
                            const now = new Date();
                            if (e.target.value === "daily") {
                                setFilterDate(now.toISOString().slice(0, 10));
                            } else if (e.target.value === "monthly") {
                                setFilterDate(now.toISOString().slice(0, 7)); // yyyy-mm
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
                            style={{ width: 80 }}
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

            {loading ? (
                <p>Loading entries...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : filteredEntries.length === 0 ? (
                <p>No overtime entries found.</p>
            ) : (
                <table border="1" cellPadding="10" cellSpacing="0" width="100%">
                    <thead>
                        <tr>
                            <th>Employee No</th>
                            <th>Name</th>
                            <th>Date</th>
                            <th>In Time</th>
                            <th>Out Time</th>
                            <th>Night Shift</th>
                            <th>Reason</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEntries.map((e) => (
                            <tr key={e._id}>
                                {editId === e._id ? (
                                    <>
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
                                                disabled
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
                                                type="checkbox"
                                                name="isNightShift"
                                                checked={editForm.isNightShift}
                                                onChange={handleEditChange}
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
                                            <button onClick={saveEdit}>Save</button>
                                            <button onClick={cancelEdit} style={{ marginLeft: 8 }}>
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{e.employee_no}</td>
                                        <td>{e.employee_name}</td>
                                        <td>{new Date(e.date).toLocaleDateString()}</td>
                                        <td>{new Date(e.inTime).toLocaleString()}</td>
                                        <td>{new Date(e.outTime).toLocaleString()}</td>
                                        <td>{e.isNightShift ? "Yes" : "No"}</td>
                                        <td>{e.reason}</td>
                                        <td>
                                            <button
                                                onClick={() => startEdit(e)}
                                                style={{ marginRight: 10 }}
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(e._id)}>Delete</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}

export default OvertimeList;