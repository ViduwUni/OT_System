import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/overtime`;
const EMPLOYEE_API = `http://${import.meta.env.VITE_APP_BACKEND_IP}:5000/api/employee`;

function OvertimeForm() {
    const [employees, setEmployees] = useState([]);
    const [employeeForms, setEmployeeForms] = useState([]);
    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(false);
    const [openIndexes, setOpenIndexes] = useState([]);

    // Load saved data and employee list on mount
    useEffect(() => {
        const savedData = sessionStorage.getItem("overtimeFormData");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.length > 0) {
                    setEmployeeForms(parsed);
                    setOpenIndexes(parsed.map((_, i) => i));
                }
            } catch (err) {
                console.error("Failed to parse session data:", err);
            }
        }
        axios
            .get(EMPLOYEE_API)
            .then((res) => {
                setEmployees(res.data);
            })
            .catch((err) => console.error(err));
    }, []);

    // Prevent overwriting sessionStorage with empty forms
    useEffect(() => {
        if (employeeForms.length > 0) {
            sessionStorage.setItem("overtimeFormData", JSON.stringify(employeeForms));
        }
    }, [employeeForms]);

    // Auto-expand all employee forms on load or add
    useEffect(() => {
        setOpenIndexes(employeeForms.map((_, i) => i));
    }, [employeeForms.length]);

    const toggleAccordion = (index) => {
        setOpenIndexes((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const combineDateTime = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return null;
        if (timeStr.includes("T")) return new Date(timeStr);
        const [hours, minutes] = timeStr.split(":").map(Number);
        const dt = new Date(dateStr);
        dt.setHours(hours, minutes, 0, 0);
        return dt;
    };

    const fixOutTimeNextDay = (inDateTime, outDateTime) => {
        if (outDateTime <= inDateTime) {
            const newOut = new Date(outDateTime);
            newOut.setDate(newOut.getDate() + 1);
            return newOut;
        }
        return outDateTime;
    };

    const calculateOT = ({ shift, date, inTime, outTime }) => {
        if (!date || !inTime || !outTime)
            return { ot_normal_hours: 0, ot_double_hours: 0, ot_triple_hours: 0 };
        const inDateTime = typeof inTime === "string" ? combineDateTime(date, inTime) : new Date(inTime);
        let outDateTime = typeof outTime === "string" ? combineDateTime(date, outTime) : new Date(outTime);
        if (!inDateTime || !outDateTime)
            return { ot_normal_hours: 0, ot_double_hours: 0, ot_triple_hours: 0 };
        outDateTime = fixOutTimeNextDay(inDateTime, outDateTime);

        const day = inDateTime.getDay();
        const totalHours = (outDateTime - inDateTime) / 3600000;

        if (day === 0) {
            return {
                ot_normal_hours: 0,
                ot_double_hours: Math.round(totalHours * 4) / 4,
                ot_triple_hours: 0,
            };
        }

        const shiftEnd = new Date(`${date}T${shift === "A" ? "15:30:00" : "17:30:00"}`);
        if (outDateTime > shiftEnd) {
            const ot = (outDateTime - shiftEnd) / 3600000;
            return { ot_normal_hours: Math.round(ot * 4) / 4, ot_double_hours: 0, ot_triple_hours: 0 };
        }

        return { ot_normal_hours: 0, ot_double_hours: 0, ot_triple_hours: 0 };
    };

    const addEmployeeSection = () => {
        setEmployeeForms((prev) => {
            const newForms = [
                ...prev,
                {
                    employee_no: "",
                    employee_name: "",
                    entries: [
                        {
                            date: "",
                            shift: "A",
                            inTime: "",
                            outTime: "",
                            isNightShift: false,
                            ot_normal_hours: 0,
                            ot_double_hours: 0,
                            ot_triple_hours: 0,
                            reason: "",
                            error: "",
                        },
                    ],
                },
            ];
            // Update openIndexes after setting new forms
            setOpenIndexes((prevOpen) => [...prevOpen, prev.length]); // `prev.length` is the new index
            return newForms;
        });
    };

    const addEntry = (empIdx) => {
        const newForms = [...employeeForms];
        newForms[empIdx].entries.push({
            date: "",
            shift: "A",
            inTime: "",
            outTime: "",
            isNightShift: false,
            ot_normal_hours: 0,
            ot_double_hours: 0,
            ot_triple_hours: 0,
            reason: "",
            error: "",
        });
        setEmployeeForms(newForms);
    };

    const removeEntry = (empIdx, entryIdx) => {
        const newForms = [...employeeForms];
        newForms[empIdx].entries.splice(entryIdx, 1);
        setEmployeeForms(newForms);
    };

    const handleEmpChange = (empIdx, e) => {
        const { value } = e.target;
        const emp = employees.find((emp) => emp.employee_no === value);
        const newForms = [...employeeForms];
        newForms[empIdx].employee_no = value;
        newForms[empIdx].employee_name = emp ? emp.employee_name : "";
        setEmployeeForms(newForms);
    };

    const handleEntryChange = (empIdx, entryIdx, e) => {
        const { name, value, type, checked } = e.target;
        const newForms = [...employeeForms];
        let entry = newForms[empIdx].entries[entryIdx];
        entry[name] = type === "checkbox" ? checked : value;

        if (name === "outTime" && entry.outTime) {
            const outDate = new Date(entry.outTime);
            const threshold = new Date(outDate);
            threshold.setHours(21, 15, 0, 0);
            entry.isNightShift = outDate > threshold;
        }

        if (["date", "shift", "inTime", "outTime"].includes(name)) {
            Object.assign(entry, calculateOT(entry));
        }

        setEmployeeForms(newForms);
    };

    const validateForms = () => {
        let valid = true;
        const updatedForms = employeeForms.map((emp) => {
            const validEntries = emp.entries.map((entry) => {
                if (!entry.date || !entry.inTime || !entry.outTime) {
                    valid = false;
                    return { ...entry, error: "Fill required fields." };
                }
                return { ...entry, error: "" };
            });
            return { ...emp, entries: validEntries };
        });
        setEmployeeForms(updatedForms);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        if (!validateForms()) {
            setSubmitError("Fix errors before submitting.");
            return;
        }

        const payloads = employeeForms.flatMap((emp) =>
            emp.entries.map((entry) => ({
                employee_no: emp.employee_no,
                employee_name: emp.employee_name,
                date: new Date(entry.date),
                shift: entry.shift,
                inTime: new Date(entry.inTime),
                outTime: new Date(entry.outTime),
                isNightShift: entry.isNightShift,
                ot_normal_hours: entry.ot_normal_hours,
                ot_double_hours: entry.ot_double_hours,
                ot_triple_hours: entry.ot_triple_hours,
                reason: entry.reason,
            }))
        );

        setLoading(true);
        try {
            await Promise.all(payloads.map((p) => axios.post(API_BASE, p)));
            alert("Submitted successfully.");
            setEmployeeForms([]);    // This empties forms and will NOT save empty array to sessionStorage thanks to the guard
            setOpenIndexes([]);
            sessionStorage.removeItem("overtimeFormData");
        } catch {
            setSubmitError("Submission failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Grouped Overtime Entry Form</h2>
            <button type="submit" onClick={handleSubmit} disabled={loading}>
                Submit All
            </button>
            <br />
            <br />
            <button
                type="button"
                onClick={() => {
                    const savedData = sessionStorage.getItem("overtimeFormData");
                    if (savedData) {
                        const parsed = JSON.parse(savedData);
                        setEmployeeForms(parsed);
                        setOpenIndexes(parsed.map((_, i) => i));
                    }
                }}
            >
                Restore Last Session
            </button>
            <button
                type="button"
                onClick={() => {
                    sessionStorage.removeItem("overtimeFormData");
                    setEmployeeForms([]);
                    setOpenIndexes([]);
                }}
            >
                Clear Saved Data
            </button>
            <br />
            <br />
            <button type="button" onClick={addEmployeeSection}>
                + Add Employee
            </button>
            <br />
            <br />
            {submitError && <p>{submitError}</p>}
            {employeeForms.map((emp, empIdx) => (
                <div
                    key={empIdx}
                >
                    <div>
                        <button type="button" onClick={() => toggleAccordion(empIdx)}>
                            {openIndexes.includes(empIdx) ? "▼" : "▶"}{" "}
                            {emp.employee_no || "Select Employee"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const newForms = employeeForms.filter((_, idx) => idx !== empIdx);
                                setEmployeeForms(newForms);
                                setOpenIndexes(openIndexes.filter((i) => i !== empIdx));
                            }}
                            disabled={employeeForms.length === 1}
                            title="Remove this employee section"
                        >
                            ❌ Remove
                        </button>
                    </div>

                    {openIndexes.includes(empIdx) && (
                        <div>
                            <label>Employee No:</label>
                            <select
                                value={emp.employee_no}
                                onChange={(e) => handleEmpChange(empIdx, e)}
                            >
                                <option value="">Select</option>
                                {employees.map((emp) => (
                                    <option key={emp._id} value={emp.employee_no}>
                                        {emp.employee_no} - {emp.employee_name}
                                    </option>
                                ))}
                            </select>

                            {emp.entries.map((entry, entryIdx) => (
                                <div
                                    key={entryIdx}
                                >
                                    <p>
                                        <strong>Entry #{entryIdx + 1}</strong>
                                    </p>
                                    {entry.error && <p>{entry.error}</p>}
                                    <input
                                        type="date"
                                        name="date"
                                        value={entry.date}
                                        onChange={(e) => handleEntryChange(empIdx, entryIdx, e)}
                                        required
                                    />
                                    <input
                                        type="datetime-local"
                                        name="inTime"
                                        value={entry.inTime}
                                        onChange={(e) => handleEntryChange(empIdx, entryIdx, e)}
                                        required
                                    />
                                    <input
                                        type="datetime-local"
                                        name="outTime"
                                        value={entry.outTime}
                                        onChange={(e) => handleEntryChange(empIdx, entryIdx, e)}
                                        required
                                    />
                                    <select
                                        name="shift"
                                        value={entry.shift}
                                        onChange={(e) => handleEntryChange(empIdx, entryIdx, e)}
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                    </select>
                                    <textarea
                                        name="reason"
                                        value={entry.reason}
                                        onChange={(e) => handleEntryChange(empIdx, entryIdx, e)}
                                        placeholder="Reason"
                                    />
                                    <div>
                                        <p>
                                            ✅ <strong>Normal OT:</strong> <span>{Number(entry.ot_normal_hours).toFixed(2)}
                                            </span> hrs |
                                            <strong> Double OT:</strong> <span>{Number(entry.ot_double_hours).toFixed(2)}</span> hrs |
                                            <strong> Triple OT:</strong> <span>{Number(entry.ot_triple_hours).toFixed(2)}</span> hrs
                                        </p>
                                        <p>
                                            🌙 <strong>Night Shift:</strong>{" "}
                                            <span>
                                                {entry.isNightShift ? "Yes" : "No"}
                                            </span>
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => removeEntry(empIdx, entryIdx)}>
                                        Remove Entry
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addEntry(empIdx)}>
                                + Add Entry
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default OvertimeForm;