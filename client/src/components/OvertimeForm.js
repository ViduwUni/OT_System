import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';
import DownloadTemplate from './DownloadTemplate';

const API_BASE = `http://${process.env.REACT_APP_BACKEND_IP}:5000/api/overtime`;
const EMPLOYEE_API = `http://${process.env.REACT_APP_BACKEND_IP}:5000/api/employee`;

function OvertimeForm() {
    const [employees, setEmployees] = useState([]);
    const [forms, setForms] = useState([
        {
            employee_no: "",
            employee_name: "",
            date: "",
            shift: "A",
            inTime: "",
            outTime: "",
            isNightShift: false,
            ot_normal_hours: 0,
            ot_double_hours: 0,
            ot_triple_hours: 0,
            reason: "",
            error: "", // To track per form error if needed
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        axios
            .get(EMPLOYEE_API)
            .then((res) => setEmployees(res.data))
            .catch((err) => console.error(err));
    }, []);

    // Helper functions (same as before)

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

    const calculateOT = (formData) => {
        const { shift, date, inTime, outTime } = formData;
        if (!date || !inTime || !outTime)
            return { ot_normal_hours: 0, ot_double_hours: 0, ot_triple_hours: 0 };

        const inDateTime = typeof inTime === 'string' ? combineDateTime(date, inTime) : new Date(inTime);
        let outDateTime = typeof outTime === 'string' ? combineDateTime(date, outTime) : new Date(outTime);
        if (!inDateTime || !outDateTime)
            return { ot_normal_hours: 0, ot_double_hours: 0, ot_triple_hours: 0 };

        outDateTime = fixOutTimeNextDay(inDateTime, outDateTime);

        const day = inDateTime.getDay(); // Sunday=0
        const totalHours = (outDateTime - inDateTime) / (1000 * 60 * 60);

        if (day === 0) {
            // Sunday: all double OT
            const roundedDouble = Math.round(totalHours * 4) / 4;
            return { ot_normal_hours: 0, ot_double_hours: roundedDouble, ot_triple_hours: 0 };
        } else {
            // Weekday: OT only after shift end
            const shiftEnd =
                shift === "A"
                    ? new Date(`${date}T15:30:00`)
                    : new Date(`${date}T17:30:00`);

            if (outDateTime > shiftEnd) {
                let ot = (outDateTime - shiftEnd) / (1000 * 60 * 60);
                const roundedOT = Math.round(ot * 4) / 4;
                return { ot_normal_hours: roundedOT, ot_double_hours: 0, ot_triple_hours: 0 };
            } else {
                return { ot_normal_hours: 0, ot_double_hours: 0, ot_triple_hours: 0 };
            }
        }
    };

    // Bulk Upload
    // Bulk Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            const employeeMap = {};
            employees.forEach(emp => {
                employeeMap[emp.employee_no] = emp.employee_name;
            });

            const skippedRows = [];
            const processedPayloads = [];

            // Helpers to handle Excel date/time
            const parseDateFromExcel = (excelValue) => {
                if (typeof excelValue === "number") {
                    const date = XLSX.SSF.parse_date_code(excelValue);
                    if (!date) return null;
                    return new Date(Date.UTC(date.y, date.m - 1, date.d));
                }
                const parsed = new Date(excelValue);
                return isNaN(parsed) ? null : parsed;
            };

            const parseTimeFromExcel = (excelValue) => {
                if (typeof excelValue === "number") {
                    const seconds = Math.round((excelValue - Math.floor(excelValue)) * 86400);
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const result = new Date(0); // base date
                    result.setUTCHours(hours, minutes, 0, 0);
                    return result;
                }
                const parsed = new Date(`1970-01-01T${excelValue}`);
                return isNaN(parsed) ? null : parsed;
            };

            const combineDateAndTime = (dateObj, timeObj) => {
                const combined = new Date(dateObj);
                combined.setHours(timeObj.getUTCHours(), timeObj.getUTCMinutes(), 0, 0);
                return combined;
            };

            rows.forEach((row, index) => {
                const rowNumber = index + 2;

                const employee_no = row["Employee No"];
                const dateRaw = row["Date"];
                const shift = row["Shift"] || "A";
                const inTimeRaw = row["In Time"];
                const outTimeRaw = row["Out Time"];
                const reason = row["Reason"] || "";

                const employee_name = row["Employee Name"] || employeeMap[employee_no] || "";

                const parsedDate = parseDateFromExcel(dateRaw);
                const inTimeObj = parseTimeFromExcel(inTimeRaw);
                const outTimeObj = parseTimeFromExcel(outTimeRaw);

                if (!employee_no || !parsedDate || !inTimeObj || !outTimeObj) {
                    skippedRows.push({
                        row: rowNumber,
                        reason: "Missing or invalid Date, In Time, or Out Time"
                    });
                    return;
                }

                const inDateTime = combineDateAndTime(parsedDate, inTimeObj);
                let outDateTime = combineDateAndTime(parsedDate, outTimeObj);

                if (outDateTime <= inDateTime) {
                    outDateTime.setDate(outDateTime.getDate() + 1);
                }

                const isNightShift =
                    outDateTime.getHours() > 21 ||
                    (outDateTime.getHours() === 21 && outDateTime.getMinutes() > 15);

                const day = inDateTime.getDay();
                const totalHours = (outDateTime - inDateTime) / (1000 * 60 * 60);

                let ot_normal_hours = 0;
                let ot_double_hours = 0;

                if (day === 0) {
                    ot_double_hours = Math.round(totalHours * 4) / 4;
                } else {
                    const shiftEnd = new Date(`${parsedDate.toISOString().split("T")[0]}T${shift === "A" ? "15:30:00" : "17:30:00"}`);
                    if (outDateTime > shiftEnd) {
                        const ot = (outDateTime - shiftEnd) / (1000 * 60 * 60);
                        ot_normal_hours = Math.round(ot * 4) / 4;
                    }
                }

                processedPayloads.push({
                    employee_no,
                    employee_name,
                    date: parsedDate,
                    shift,
                    inTime: inDateTime,
                    outTime: outDateTime,
                    isNightShift,
                    ot_normal_hours,
                    ot_double_hours,
                    ot_triple_hours: 0,
                    reason
                });
            });

            if (processedPayloads.length === 0) {
                alert("❌ No valid rows to import. Please check your file.");
                if (skippedRows.length > 0) {
                    const summary = skippedRows.map(r => `Row ${r.row}: ${r.reason}`).join("\n");
                    console.warn("Skipped Rows:\n" + summary);
                }
                return;
            }

            try {
                await axios.post(`${API_BASE}/bulk`, processedPayloads);
                alert(`✅ Successfully imported ${processedPayloads.length} entries.`);

                if (skippedRows.length > 0) {
                    const summary = skippedRows.map(r => `Row ${r.row}: ${r.reason}`).join("\n");
                    alert(`⚠️ Skipped ${skippedRows.length} row(s):\n\n${summary}`);
                }
            } catch (err) {
                console.error(err);
                alert("❌ Bulk import failed.");
            }
        };

        reader.readAsBinaryString(file);
    };

    // Handle input changes per form index
    const handleChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        setForms((prevForms) => {
            const newForms = [...prevForms];
            let updatedForm = {
                ...newForms[index],
                [name]: type === "checkbox" ? checked : value,
            };

            // Auto fill employee_name when employee_no changes
            if (name === "employee_no") {
                const emp = employees.find((e) => e.employee_no === value);
                updatedForm.employee_name = emp ? emp.employee_name : "";
            }

            // Auto check night shift if outTime past 9:15pm
            if (name === "outTime" && updatedForm.outTime) {
                const outDate = new Date(updatedForm.outTime);
                const nightShiftThreshold = new Date(outDate);
                nightShiftThreshold.setHours(21, 15, 0, 0);
                updatedForm.isNightShift = outDate > nightShiftThreshold;
            }

            // Recalculate OT on key fields change
            if (["date", "shift", "inTime", "outTime"].includes(name)) {
                const ot = calculateOT(updatedForm);
                updatedForm = { ...updatedForm, ...ot };
            }

            newForms[index] = updatedForm;
            return newForms;
        });
    };

    // Add a new empty form
    const addForm = () => {
        setForms((prev) => [
            ...prev,
            {
                employee_no: "",
                employee_name: "",
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
        ]);
    };

    // Remove form by index
    const removeForm = (index) => {
        setForms((prev) => prev.filter((_, i) => i !== index));
    };

    // Validate all forms before submit
    const validateForms = () => {
        let valid = true;
        const newForms = forms.map((f) => {
            if (
                !f.employee_no ||
                !f.employee_name ||
                !f.date ||
                !f.inTime ||
                !f.outTime
            ) {
                valid = false;
                return { ...f, error: "Please fill in all required fields." };
            }
            if (
                f.ot_normal_hours < 0 ||
                f.ot_double_hours < 0 ||
                f.ot_triple_hours < 0
            ) {
                valid = false;
                return { ...f, error: "OT hours cannot be negative." };
            }
            return { ...f, error: "" };
        });
        setForms(newForms);
        return valid;
    };

    // Submit all forms at once
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        if (!validateForms()) {
            setSubmitError("Fix errors before submitting.");
            return;
        }

        setLoading(true);
        try {
            // Map form data to payload expected by backend
            const payloads = forms.map((f) => ({
                employee_no: f.employee_no,
                employee_name: f.employee_name,
                date: new Date(f.date),
                shift: f.shift,
                inTime: new Date(f.inTime),
                outTime: new Date(f.outTime),
                isNightShift: f.isNightShift,
                ot_normal_hours: f.ot_normal_hours,
                ot_double_hours: f.ot_double_hours,
                ot_triple_hours: f.ot_triple_hours,
                reason: f.reason,
            }));

            // Post each entry sequentially or use Promise.all for parallel
            await Promise.all(payloads.map((p) => axios.post(API_BASE, p)));

            alert("All entries created successfully.");
            // Reset forms to single empty
            setForms([
                {
                    employee_no: "",
                    employee_name: "",
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
            ]);
        } catch {
            setSubmitError("Failed to save entries.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Add Multiple Overtime Entries</h2>
            {submitError && <p style={{ color: "red" }}>{submitError}</p>}
            {loading && <p>Loading...</p>}

            <div>
                <h3>Bulk Upload</h3>
                <DownloadTemplate />
                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </div>
            <br />

            <form onSubmit={handleSubmit}>
                {forms.map((form, i) => (
                    <React.Fragment key={i}>
                        <>
                            {form.error && (
                                <p style={{ color: "red", fontWeight: "bold" }}>{form.error}</p>
                            )}

                            <div style={{ backgroundColor: "#f9f9f9", padding: "8px", marginBottom: "10px", border: "1px dashed #ccc", fontSize: "0.9em" }}>
                                <strong>Summary</strong><br />
                                {form.employee_no && <div key="empno"><strong>Emp No:</strong> {form.employee_no}</div>}
                                {form.employee_name && <div key="name"><strong>Name:</strong> {form.employee_name}</div>}
                                {form.date && <div key="date"><strong>Date:</strong> {form.date}</div>}
                                {form.inTime && <div key="in"><strong>In:</strong> {new Date(form.inTime).toLocaleString()}</div>}
                                {form.outTime && <div key="out"><strong>Out:</strong> {new Date(form.outTime).toLocaleString()}</div>}
                            </div>
                            <div
                                key={i}
                                style={{
                                    border: "1px solid #ccc",
                                    marginBottom: 20,
                                    padding: 10,
                                    position: "relative",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => removeForm(i)}
                                    style={{ position: "absolute", top: 5, right: 5 }}
                                    disabled={forms.length === 1}
                                    title="Remove this entry"
                                >
                                    X
                                </button>

                                {form.error && (
                                    <p style={{ color: "red", fontWeight: "bold" }}>{form.error}</p>
                                )}

                                <div>
                                    <label>Employee No *</label>
                                    <br />
                                    <select
                                        name="employee_no"
                                        value={form.employee_no}
                                        onChange={(e) => handleChange(i, e)}
                                        required
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map((emp) => (
                                            <option key={emp._id} value={emp.employee_no}>
                                                {emp.employee_no} - {emp.employee_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Employee Name *</label>
                                    <br />
                                    <input
                                        type="text"
                                        name="employee_name"
                                        value={form.employee_name}
                                        readOnly
                                        disabled
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Shift *</label>
                                    <br />
                                    <select
                                        name="shift"
                                        value={form.shift}
                                        onChange={(e) => handleChange(i, e)}
                                        required
                                    >
                                        <option value="A">Shift A (6:30–3:30)</option>
                                        <option value="B">Shift B (8:30–5:30)</option>
                                    </select>
                                </div>

                                <div>
                                    <label>Date *</label>
                                    <br />
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={(e) => handleChange(i, e)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label>In Time *</label>
                                    <br />
                                    <input
                                        type="datetime-local"
                                        name="inTime"
                                        value={form.inTime}
                                        onChange={(e) => handleChange(i, e)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Out Time *</label>
                                    <br />
                                    <input
                                        type="datetime-local"
                                        name="outTime"
                                        value={form.outTime}
                                        onChange={(e) => handleChange(i, e)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isNightShift"
                                            checked={form.isNightShift}
                                            disabled
                                            readOnly
                                        />{" "}
                                        Night Shift
                                    </label>
                                </div>

                                <div>
                                    <label>OT Normal Hours</label>
                                    <br />
                                    <input
                                        type="number"
                                        name="ot_normal_hours"
                                        value={form.ot_normal_hours}
                                        readOnly
                                        disabled
                                        step="0.25"
                                    />
                                </div>

                                <div>
                                    <label>OT Double Hours</label>
                                    <br />
                                    <input
                                        type="number"
                                        name="ot_double_hours"
                                        value={form.ot_double_hours}
                                        readOnly
                                        disabled
                                        step="0.25"
                                    />
                                </div>

                                <div>
                                    <label>OT Triple Hours</label>
                                    <br />
                                    <input
                                        type="number"
                                        name="ot_triple_hours"
                                        value={form.ot_triple_hours}
                                        readOnly
                                        disabled
                                        step="0.25"
                                    />
                                </div>

                                <div>
                                    <label>Reason</label>
                                    <br />
                                    <textarea
                                        name="reason"
                                        value={form.reason}
                                        onChange={(e) => handleChange(i, e)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </>
                    </React.Fragment>
                ))}

                <button type="button" onClick={addForm} disabled={loading}>
                    + Add Another Entry
                </button>

                <br />
                <br />

                <button type="submit" disabled={loading}>
                    Submit All
                </button>
            </form >
        </div>
    );
}

export default OvertimeForm;