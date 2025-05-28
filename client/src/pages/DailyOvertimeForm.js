import React, { useState, useEffect } from 'react';
import axios from 'axios';

const defaultEntry = {
    employee_no: '',
    employee_name: '',
    date: '',
    shift: 'A',
    inTime: '',
    outTime: '',
    ot_normal_hours: 0,
    ot_double_hours: 0,
    ot_triple_hours: 0,
    reason: '',
    isNightShift: false
};

const DailyOvertimeForm = () => {
    const [entries, setEntries] = useState([defaultEntry]);
    const [employees, setEmployees] = useState([]);
    const [warnings, setWarnings] = useState({});

    useEffect(() => {
        axios.get('http://localhost:5000/api/employee')
            .then(res => setEmployees(res.data))
            .catch(err => console.error(err));
    }, []);

    const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(":").map(Number);
        return new Date(0, 0, 0, h, m);
    };

    const calculateOT = (entry, index) => {
        const { shift, date, inTime, outTime } = entry;
        if (!date || !inTime || !outTime) return;

        const day = new Date(date).getDay();
        const inT = parseTime(inTime);
        const outT = parseTime(outTime);
        const totalHours = (outT - inT) / (1000 * 60 * 60);

        const updated = [...entries];
        let newWarnings = { ...warnings };

        if (day === 0) {
            if (updated[index].ot_double_hours !== Math.round(totalHours * 4) / 4) {
                newWarnings[index] = `Double OT overridden (Sunday).`;
            } else {
                delete newWarnings[index];
            }
            updated[index].ot_normal_hours = 0;
            updated[index].ot_double_hours = Math.round(totalHours * 4) / 4;
        } else {
            let shiftEnd = shift === 'A' ? new Date(0, 0, 0, 15, 30) : new Date(0, 0, 0, 17, 30);

            if (outT > shiftEnd) {
                const ot = (outT - shiftEnd) / (1000 * 60 * 60);
                const roundedOT = Math.round(ot * 4) / 4;
                if (updated[index].ot_normal_hours !== roundedOT) {
                    newWarnings[index] = `Normal OT overridden (out time).`;
                } else {
                    delete newWarnings[index];
                }
                updated[index].ot_normal_hours = roundedOT;
            } else {
                updated[index].ot_normal_hours = 0;
                delete newWarnings[index];
            }
            updated[index].ot_double_hours = 0;
        }

        setWarnings(newWarnings);
        setEntries(updated);
    };

    const handleEmployeeSelect = (index, empNo) => {
        const selected = employees.find(emp => emp.employee_no === empNo);
        if (!selected) return;

        const updated = [...entries];
        updated[index].employee_no = selected.employee_no;
        updated[index].employee_name = selected.employee_name;
        setEntries(updated);
    };

    const handleChange = (index, field, value) => {
        const updated = [...entries];
        updated[index][field] = value;
        setEntries(updated);

        if (['date', 'shift', 'inTime', 'outTime'].includes(field)) {
            calculateOT(updated[index], index);
        }
    };

    const addRow = () => setEntries([...entries, defaultEntry]);

    const removeRow = (index) => {
        const updated = entries.filter((_, i) => i !== index);
        setEntries(updated);
        const newWarnings = { ...warnings };
        delete newWarnings[index];
        setWarnings(newWarnings);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            for (let entry of entries) {
                const res = await axios.get(`http://localhost:5000/api/overtime?employee_no=${entry.employee_no}&date=${entry.date}`);
                const existing = res.data[0]; // match the one entry returned

                if (existing) {
                    const confirmOverwrite = window.confirm(`Entry already exists for ${entry.employee_name} on ${entry.date}. Do you want to overwrite it?`);
                    if (confirmOverwrite) {
                        await axios.put(`http://localhost:5000/api/overtime/${existing._id}`, entry);
                    }
                } else {
                    await axios.post(`http://localhost:5000/api/overtime`, entry);
                }
            }

            alert('Entries submitted!');
            setEntries([defaultEntry]);
            setWarnings({});
        } catch (err) {
            console.error(err);
            alert('Submission failed.');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Daily Overtime Entry</h2>
            <form onSubmit={handleSubmit}>
                {entries.map((entry, idx) => (
                    <div key={idx} className="border p-2 mb-2 rounded">
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={entry.employee_no}
                                onChange={(e) => handleEmployeeSelect(idx, e.target.value)}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp.employee_no}>
                                        {emp.employee_no} - {emp.employee_name}
                                    </option>
                                ))}
                            </select>

                            <input type="text" value={entry.employee_name} disabled />

                            <select value={entry.shift} onChange={(e) => handleChange(idx, 'shift', e.target.value)}>
                                <option value="A">Shift A (6:30–3:30)</option>
                                <option value="B">Shift B (8:30–5:30)</option>
                            </select>

                            <input
                                type="date"
                                value={entry.date}
                                onChange={(e) => handleChange(idx, 'date', e.target.value)}
                                required
                            />

                            <input
                                type="time"
                                value={entry.inTime}
                                onChange={(e) => handleChange(idx, 'inTime', e.target.value)}
                                required
                            />

                            <input
                                type="time"
                                value={entry.outTime}
                                onChange={(e) => handleChange(idx, 'outTime', e.target.value)}
                                required
                            />

                            <div>
                                <input type="number" value={entry.ot_normal_hours} disabled />
                                {warnings[idx] && (
                                    <small className="text-yellow-600">{warnings[idx]}</small>
                                )}
                            </div>
                            <input type="number" value={entry.ot_double_hours} disabled />

                            <input
                                type="number"
                                value={entry.ot_triple_hours}
                                onChange={(e) => handleChange(idx, 'ot_triple_hours', +e.target.value)}
                                disabled
                            />

                            <input
                                type="text"
                                placeholder="Reason"
                                value={entry.reason}
                                onChange={(e) => handleChange(idx, 'reason', e.target.value)}
                            />

                            <label>
                                Night Shift:
                                <input
                                    type="checkbox"
                                    checked={entry.isNightShift}
                                    onChange={(e) => handleChange(idx, 'isNightShift', e.target.checked)}
                                />
                            </label>
                        </div>
                        <button type="button" onClick={() => removeRow(idx)} className="text-red-500 mt-2">
                            Remove
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addRow} className="bg-blue-500 text-white px-3 py-1 rounded">
                    Add Row
                </button>
                <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded ml-2">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default DailyOvertimeForm;